import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type UserType = 'traveler' | 'volunteer';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  userType: UserType;
  onboardingCompleted: boolean;
  preferredLanguage: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  setOnboardingCompleted: () => void;
  updatePreferredLanguage: (lang: string | null) => void;
}

export interface SignUpData {
  email: string;
  password: string;
  phone: string;
  userType: 'traveler' | 'volunteer';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(authUserId: string): Promise<User | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (userError) {
      console.error('Failed to fetch user profile:', userError);
      return null;
    }

    if (!userData) {
      console.warn('No users row found for auth user:', authUserId);
      return null;
    }

    // Determine user type by checking which profile table has a row
    const { data: vipProfile } = await supabase
      .from('vip_profile')
      .select('id, preferences')
      .eq('user_id', authUserId)
      .maybeSingle();

    const userType: UserType = vipProfile ? 'traveler' : 'volunteer';

    let preferredLanguage: string | null = null;
    let onboardingCompleted = false;

    if (userType === 'traveler') {
      onboardingCompleted = vipProfile?.preferences != null;
      if (vipProfile?.preferences) {
        try {
          const prefs = typeof vipProfile.preferences === 'string'
            ? JSON.parse(vipProfile.preferences)
            : vipProfile.preferences;
          preferredLanguage = prefs.language || null;
        } catch (e) {
          console.error('Failed to parse traveler preferences:', e);
        }
      }
    } else {
      // Volunteer
      const { data: volunteerProfile } = await supabase
        .from('volunteer_profile')
        .select('preferences')
        .eq('user_id', authUserId)
        .maybeSingle();

      onboardingCompleted = volunteerProfile?.preferences != null;
      if (volunteerProfile?.preferences) {
        try {
          const prefs = typeof volunteerProfile.preferences === 'string'
            ? JSON.parse(volunteerProfile.preferences)
            : volunteerProfile.preferences;
          preferredLanguage = prefs.languages?.[0] || null;
        } catch (e) {
          console.error('Failed to parse volunteer preferences:', e);
        }
      }
    }

    return {
      id: userData.id,
      email: userData.email,
      phone: userData.phone,
      userType,
      onboardingCompleted,
      preferredLanguage,
    };
  } catch (error) {
    console.error('Unexpected error in fetchUserProfile:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          // This handles "Refresh Token Not Found" and other auth initialization errors
          console.warn('Auth session initialization error, signing out:', error.message);
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        if (session) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Critical error during auth init:', err);
        // Fallback to signed out state
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else if (session) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(true); // Keep loading state until we handle error or success
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError || !authData.user) {
        throw authError || new Error('Sign up failed');
      }

      const userId = authData.user.id;

      const { error: userInsertError } = await supabase
        .from('users')
        .insert({ id: userId, email: data.email, phone: data.phone || null });

      if (userInsertError) throw userInsertError;

      if (data.userType === 'traveler') {
        const { error: profileError } = await supabase
          .from('vip_profile')
          .insert({ user_id: userId });
        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from('volunteer_profile')
          .insert({ user_id: userId });
        if (profileError) throw profileError;
      }

      const profile = await fetchUserProfile(userId);
      setUser(profile);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const setOnboardingCompleted = () => {
    setUser((prev) => prev ? { ...prev, onboardingCompleted: true } : prev);
  };

  const updatePreferredLanguage = (lang: string | null) => {
    setUser((prev) => prev ? { ...prev, preferredLanguage: lang } : prev);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        setOnboardingCompleted,
        updatePreferredLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
