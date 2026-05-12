export type TripStatus = 'PENDING' | 'MATCHED' | 'CANCELED' | 'COMPLETED';
export type MatchStatus = 'ACTIVE' | 'CANCELED' | 'COMPLETED';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          created_at?: string | null;
        };
        Update: {
          email?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      vip_profile: {
        Row: {
          id: string;
          user_id: string;
          mobility_aids: unknown;
          preferences: unknown;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          mobility_aids?: unknown;
          preferences?: unknown;
          created_at?: string | null;
        };
        Update: {
          mobility_aids?: unknown;
          preferences?: unknown;
        };
        Relationships: [];
      };
      volunteer_profile: {
        Row: {
          id: string;
          user_id: string;
          experience: string | null;
          preferences: unknown;
          is_available: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          experience?: string | null;
          preferences?: unknown;
          is_available?: boolean;
          created_at?: string | null;
        };
        Update: {
          experience?: string | null;
          preferences?: unknown;
          is_available?: boolean;
        };
        Relationships: [];
      };
      trip_request: {
        Row: {
          id: string;
          vip_user_id: string;
          departure_station: string;
          arrival_station: string;
          departure_time: string;
          status: TripStatus;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          vip_user_id: string;
          departure_station: string;
          arrival_station: string;
          departure_time: string;
          status?: TripStatus;
          created_at?: string | null;
        };
        Update: {
          departure_station?: string;
          arrival_station?: string;
          departure_time?: string;
          status?: TripStatus;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          trip_request_id: string;
          volunteer_id: string;
          vip_user_id: string;
          matched_at: string | null;
          status: MatchStatus;
        };
        Insert: {
          id?: string;
          trip_request_id: string;
          volunteer_id: string;
          vip_user_id: string;
          matched_at?: string | null;
          status?: MatchStatus;
        };
        Update: {
          status?: MatchStatus;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          created_at?: string | null;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          trip_request_id: string;
          reviewer_user_id: string;
          reviewed_user_id: string;
          rating: number;
          comment: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_request_id: string;
          reviewer_user_id: string;
          reviewed_user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          latitude: number;
          longitude: number;
          recorded_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          latitude: number;
          longitude: number;
          recorded_at?: string | null;
        };
        Update: {
          latitude?: number;
          longitude?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      volunteer_accept_match: {
        Args: { p_match_id: string };
        Returns: undefined;
      };
      volunteer_decline_match: {
        Args: { p_match_id: string };
        Returns: undefined;
      };
      create_matches_for_trip: {
        Args: { p_trip_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      trip_status: TripStatus;
      match_status: MatchStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
