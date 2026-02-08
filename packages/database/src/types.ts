/**
 * Auto-generated Supabase Database types.
 * In production, regenerate with: supabase gen types typescript --local > types.ts
 * This file is manually authored to match the spec's SQL schema until Supabase is connected.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          location: unknown | null;
          radius_km: number;
          preferred_tcgs: TcgType[];
          rating_score: number;
          total_trades: number;
          expo_push_token: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          location?: unknown | null;
          radius_km?: number;
          preferred_tcgs?: TcgType[];
          rating_score?: number;
          total_trades?: number;
          expo_push_token?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          location?: unknown | null;
          radius_km?: number;
          preferred_tcgs?: TcgType[];
          rating_score?: number;
          total_trades?: number;
          expo_push_token?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_items: {
        Row: {
          id: string;
          user_id: string;
          tcg: TcgType;
          external_id: string;
          card_name: string;
          set_name: string;
          set_code: string;
          card_number: string;
          image_url: string;
          rarity: string | null;
          condition: CardCondition;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tcg: TcgType;
          external_id: string;
          card_name: string;
          set_name: string;
          set_code: string;
          card_number: string;
          image_url: string;
          rarity?: string | null;
          condition?: CardCondition;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tcg?: TcgType;
          external_id?: string;
          card_name?: string;
          set_name?: string;
          set_code?: string;
          card_number?: string;
          image_url?: string;
          rarity?: string | null;
          condition?: CardCondition;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          type: ListingType;
          tcg: TcgType;
          card_name: string;
          card_set: string;
          card_number: string;
          card_external_id: string;
          card_image_url: string;
          card_rarity: string | null;
          card_market_price: number | null;
          condition: CardCondition;
          asking_price: number | null;
          description: string | null;
          photos: string[];
          status: ListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ListingType;
          tcg: TcgType;
          card_name: string;
          card_set: string;
          card_number: string;
          card_external_id: string;
          card_image_url: string;
          card_rarity?: string | null;
          card_market_price?: number | null;
          condition: CardCondition;
          asking_price?: number | null;
          description?: string | null;
          photos?: string[];
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: ListingType;
          tcg?: TcgType;
          card_name?: string;
          card_set?: string;
          card_number?: string;
          card_external_id?: string;
          card_image_url?: string;
          card_rarity?: string | null;
          card_market_price?: number | null;
          condition?: CardCondition;
          asking_price?: number | null;
          description?: string | null;
          photos?: string[];
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      swipes: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          direction: SwipeDirection;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          direction: SwipeDirection;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          direction?: SwipeDirection;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          listing_a_id: string;
          listing_b_id: string;
          status: MatchStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          listing_a_id: string;
          listing_b_id: string;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          listing_a_id?: string;
          listing_b_id?: string;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          match_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          type: MessageType;
          body: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          type?: MessageType;
          body?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          type?: MessageType;
          body?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
      };
      meetups: {
        Row: {
          id: string;
          match_id: string;
          proposal_message_id: string;
          shop_id: string | null;
          location_name: string | null;
          location_coords: unknown | null;
          proposed_time: string | null;
          status: MeetupStatus;
          user_a_completed: boolean;
          user_b_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          proposal_message_id: string;
          shop_id?: string | null;
          location_name?: string | null;
          location_coords?: unknown | null;
          proposed_time?: string | null;
          status?: MeetupStatus;
          user_a_completed?: boolean;
          user_b_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          proposal_message_id?: string;
          shop_id?: string | null;
          location_name?: string | null;
          location_coords?: unknown | null;
          proposed_time?: string | null;
          status?: MeetupStatus;
          user_a_completed?: boolean;
          user_b_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          name: string;
          address: string;
          location: unknown;
          hours: Json | null;
          website: string | null;
          phone: string | null;
          supported_tcgs: TcgType[];
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          location: unknown;
          hours?: Json | null;
          website?: string | null;
          phone?: string | null;
          supported_tcgs?: TcgType[];
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          location?: unknown;
          hours?: Json | null;
          website?: string | null;
          phone?: string | null;
          supported_tcgs?: TcgType[];
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          meetup_id: string;
          rater_id: string;
          ratee_id: string;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meetup_id: string;
          rater_id: string;
          ratee_id: string;
          score: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          meetup_id?: string;
          rater_id?: string;
          ratee_id?: string;
          score?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string;
          reported_message_id: string | null;
          category: ReportCategory;
          description: string | null;
          status: ReportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id: string;
          reported_message_id?: string | null;
          category: ReportCategory;
          description?: string | null;
          status?: ReportStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string;
          reported_message_id?: string | null;
          category?: ReportCategory;
          description?: string | null;
          status?: ReportStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      tcg_type: TcgType;
      listing_type: ListingType;
      card_condition: CardCondition;
      listing_status: ListingStatus;
      swipe_direction: SwipeDirection;
      match_status: MatchStatus;
      message_type: MessageType;
      meetup_status: MeetupStatus;
      report_category: ReportCategory;
      report_status: ReportStatus;
    };
  };
};

export type TcgType = 'pokemon' | 'mtg' | 'yugioh';
export type ListingType = 'wts' | 'wtb' | 'wtt';
export type CardCondition = 'nm' | 'lp' | 'mp' | 'hp' | 'dmg';
export type ListingStatus = 'active' | 'matched' | 'completed' | 'expired';
export type SwipeDirection = 'like' | 'pass';
export type MatchStatus = 'active' | 'completed' | 'cancelled';
export type MessageType = 'text' | 'image' | 'card_offer' | 'card_offer_response' | 'meetup_proposal' | 'meetup_response' | 'system';
export type MeetupStatus = 'confirmed' | 'completed' | 'cancelled';
export type ReportCategory = 'inappropriate_content' | 'scam' | 'counterfeit' | 'no_show' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CollectionItemRow = Database['public']['Tables']['collection_items']['Row'];
export type CollectionItemInsert = Database['public']['Tables']['collection_items']['Insert'];
export type ListingRow = Database['public']['Tables']['listings']['Row'];
export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
export type ListingUpdate = Database['public']['Tables']['listings']['Update'];
export type SwipeRow = Database['public']['Tables']['swipes']['Row'];
export type SwipeInsert = Database['public']['Tables']['swipes']['Insert'];
export type MatchRow = Database['public']['Tables']['matches']['Row'];
export type ConversationRow = Database['public']['Tables']['conversations']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MeetupRow = Database['public']['Tables']['meetups']['Row'];
export type MeetupUpdate = Database['public']['Tables']['meetups']['Update'];
export type ShopRow = Database['public']['Tables']['shops']['Row'];
export type RatingRow = Database['public']['Tables']['ratings']['Row'];
export type RatingInsert = Database['public']['Tables']['ratings']['Insert'];
export type BlockRow = Database['public']['Tables']['blocks']['Row'];
export type BlockInsert = Database['public']['Tables']['blocks']['Insert'];
export type ReportRow = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
