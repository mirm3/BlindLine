import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface OnboardingData {
  visualImpairment: string | null;
  mobilityAids: string[];
  assistanceNeeds: string[];
  language: string | null;
}

interface OnboardingContextType {
  data: OnboardingData;
  setVisualImpairment: (value: string | null) => void;
  setMobilityAids: (value: string[]) => void;
  setAssistanceNeeds: (value: string[]) => void;
  setLanguage: (value: string | null) => void;
  submitOnboarding: () => Promise<void>;
  isSubmitting: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, setOnboardingCompleted, updatePreferredLanguage } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    visualImpairment: null,
    mobilityAids: [],
    assistanceNeeds: [],
    language: null,
  });

  const setVisualImpairment = (value: string | null) => {
    setData((prev) => ({ ...prev, visualImpairment: value }));
  };

  const setMobilityAids = (value: string[]) => {
    setData((prev) => ({ ...prev, mobilityAids: value }));
  };

  const setAssistanceNeeds = (value: string[]) => {
    setData((prev) => ({ ...prev, assistanceNeeds: value }));
  };

  const setLanguage = (value: string | null) => {
    setData((prev) => ({ ...prev, language: value }));
  };

  const submitOnboarding = async () => {
    if (!user) throw new Error('User not authenticated');

    setIsSubmitting(true);
    try {
      const langValue = data.language === 'skip' ? null : data.language;

      const preferences = JSON.stringify({
        visual_impairment: data.visualImpairment,
        assistance_needs: data.assistanceNeeds,
        language: langValue,
      });

      const mobilityAids = JSON.stringify(data.mobilityAids);

      const { error: profileUpdateError } = await supabase
        .from('vip_profile')
        .update({
          mobility_aids: mobilityAids,
          preferences: preferences,
        })
        .eq('user_id', user.id);

      if (profileUpdateError) throw new Error(profileUpdateError.message);

      updatePreferredLanguage(langValue);
      setOnboardingCompleted();
    } catch (err: unknown) {
      console.error('Failed to submit onboarding:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setVisualImpairment,
        setMobilityAids,
        setAssistanceNeeds,
        setLanguage,
        submitOnboarding,
        isSubmitting,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
