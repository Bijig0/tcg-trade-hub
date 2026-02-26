Connecting to db 5432
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          acquired_at: string | null
          card_name: string
          card_number: string
          condition: Database["public"]["Enums"]["card_condition"]
          created_at: string
          external_id: string
          grading_company: string | null
          grading_score: string | null
          id: string
          image_url: string
          is_sealed: boolean
          is_tradeable: boolean
          is_wishlist: boolean
          market_price: number | null
          notes: string | null
          photos: string[]
          product_type: string | null
          purchase_price: number | null
          quantity: number
          rarity: string | null
          set_code: string
          set_name: string
          tcg: Database["public"]["Enums"]["tcg_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          card_name: string
          card_number: string
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          external_id: string
          grading_company?: string | null
          grading_score?: string | null
          id?: string
          image_url: string
          is_sealed?: boolean
          is_tradeable?: boolean
          is_wishlist?: boolean
          market_price?: number | null
          notes?: string | null
          photos?: string[]
          product_type?: string | null
          purchase_price?: number | null
          quantity?: number
          rarity?: string | null
          set_code: string
          set_name: string
          tcg: Database["public"]["Enums"]["tcg_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          card_name?: string
          card_number?: string
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          external_id?: string
          grading_company?: string | null
          grading_score?: string | null
          id?: string
          image_url?: string
          is_sealed?: boolean
          is_tradeable?: boolean
          is_wishlist?: boolean
          market_price?: number | null
          notes?: string | null
          photos?: string[]
          product_type?: string | null
          purchase_price?: number | null
          quantity?: number
          rarity?: string | null
          set_code?: string
          set_name?: string
          tcg?: Database["public"]["Enums"]["tcg_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_nicknames: {
        Row: {
          conversation_id: string
          created_at: string
          nickname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          nickname: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          nickname?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_nicknames_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_nicknames_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reads: {
        Row: {
          conversation_id: string
          last_read_at: string
          last_read_message_id: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string
          last_read_message_id?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string
          last_read_message_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reads_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          match_id: string
          negotiation_status: Database["public"]["Enums"]["negotiation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          negotiation_status?: Database["public"]["Enums"]["negotiation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          negotiation_status?: Database["public"]["Enums"]["negotiation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_items: {
        Row: {
          asking_price: number | null
          card_external_id: string
          card_image_url: string
          card_name: string
          card_number: string | null
          card_rarity: string | null
          card_set: string | null
          collection_item_id: string | null
          condition: Database["public"]["Enums"]["card_condition"]
          created_at: string
          id: string
          listing_id: string
          market_price: number | null
          quantity: number
          tcg: Database["public"]["Enums"]["tcg_type"]
        }
        Insert: {
          asking_price?: number | null
          card_external_id: string
          card_image_url: string
          card_name: string
          card_number?: string | null
          card_rarity?: string | null
          card_set?: string | null
          collection_item_id?: string | null
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          id?: string
          listing_id: string
          market_price?: number | null
          quantity?: number
          tcg: Database["public"]["Enums"]["tcg_type"]
        }
        Update: {
          asking_price?: number | null
          card_external_id?: string
          card_image_url?: string
          card_name?: string
          card_number?: string | null
          card_rarity?: string | null
          card_set?: string | null
          collection_item_id?: string | null
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          id?: string
          listing_id?: string
          market_price?: number | null
          quantity?: number
          tcg?: Database["public"]["Enums"]["tcg_type"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_items_collection_item_id_fkey"
            columns: ["collection_item_id"]
            isOneToOne: false
            referencedRelation: "collection_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          cash_amount: number
          created_at: string
          description: string | null
          id: string
          photos: string[]
          status: Database["public"]["Enums"]["listing_status"]
          tcg: Database["public"]["Enums"]["tcg_type"]
          title: string
          total_value: number
          trade_wants: Json
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          photos?: string[]
          status?: Database["public"]["Enums"]["listing_status"]
          tcg: Database["public"]["Enums"]["tcg_type"]
          title: string
          total_value?: number
          trade_wants?: Json
          type: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          photos?: string[]
          status?: Database["public"]["Enums"]["listing_status"]
          tcg?: Database["public"]["Enums"]["tcg_type"]
          title?: string
          total_value?: number
          trade_wants?: Json
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          offer_id: string
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          offer_id: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          offer_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetups: {
        Row: {
          created_at: string
          id: string
          location_coords: unknown
          location_name: string | null
          match_id: string
          proposal_message_id: string
          proposed_time: string | null
          shop_id: string | null
          status: Database["public"]["Enums"]["meetup_status"]
          updated_at: string
          user_a_completed: boolean
          user_b_completed: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          location_coords?: unknown
          location_name?: string | null
          match_id: string
          proposal_message_id: string
          proposed_time?: string | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["meetup_status"]
          updated_at?: string
          user_a_completed?: boolean
          user_b_completed?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          location_coords?: unknown
          location_name?: string | null
          match_id?: string
          proposal_message_id?: string
          proposed_time?: string | null
          shop_id?: string | null
          status?: Database["public"]["Enums"]["meetup_status"]
          updated_at?: string
          user_a_completed?: boolean
          user_b_completed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "meetups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetups_proposal_message_id_fkey"
            columns: ["proposal_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetups_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          payload: Json | null
          sender_id: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          payload?: Json | null
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          payload?: Json | null
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_items: {
        Row: {
          card_external_id: string
          card_image_url: string
          card_name: string
          card_number: string | null
          card_set: string | null
          collection_item_id: string | null
          condition: Database["public"]["Enums"]["card_condition"]
          created_at: string
          id: string
          market_price: number | null
          offer_id: string
          quantity: number
          tcg: Database["public"]["Enums"]["tcg_type"]
        }
        Insert: {
          card_external_id: string
          card_image_url: string
          card_name: string
          card_number?: string | null
          card_set?: string | null
          collection_item_id?: string | null
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          id?: string
          market_price?: number | null
          offer_id: string
          quantity?: number
          tcg: Database["public"]["Enums"]["tcg_type"]
        }
        Update: {
          card_external_id?: string
          card_image_url?: string
          card_name?: string
          card_number?: string | null
          card_set?: string | null
          collection_item_id?: string | null
          condition?: Database["public"]["Enums"]["card_condition"]
          created_at?: string
          id?: string
          market_price?: number | null
          offer_id?: string
          quantity?: number
          tcg?: Database["public"]["Enums"]["tcg_type"]
        }
        Relationships: [
          {
            foreignKeyName: "offer_items_collection_item_id_fkey"
            columns: ["collection_item_id"]
            isOneToOne: false
            referencedRelation: "collection_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          cash_amount: number
          created_at: string
          id: string
          listing_id: string
          message: string | null
          offerer_id: string
          parent_offer_id: string | null
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          cash_amount?: number
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          offerer_id: string
          parent_offer_id?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          cash_amount?: number
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          offerer_id?: string
          parent_offer_id?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_offerer_id_fkey"
            columns: ["offerer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_parent_offer_id_fkey"
            columns: ["parent_offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_registrations: {
        Row: {
          asking_price: number | null
          card_external_id: string | null
          card_image_url: string | null
          card_name: string
          card_set: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          tcg: Database["public"]["Enums"]["tcg_type"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          asking_price?: number | null
          card_external_id?: string | null
          card_image_url?: string | null
          card_name: string
          card_set?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          tcg: Database["public"]["Enums"]["tcg_type"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          asking_price?: number | null
          card_external_id?: string | null
          card_image_url?: string | null
          card_name?: string
          card_set?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          tcg?: Database["public"]["Enums"]["tcg_type"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          meetup_id: string
          ratee_id: string
          rater_id: string
          score: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          meetup_id: string
          ratee_id: string
          rater_id: string
          score: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          meetup_id?: string
          ratee_id?: string
          rater_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ratee_id_fkey"
            columns: ["ratee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          category: Database["public"]["Enums"]["report_category"]
          created_at: string
          description: string | null
          id: string
          reported_message_id: string | null
          reported_user_id: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["report_category"]
          created_at?: string
          description?: string | null
          id?: string
          reported_message_id?: string | null
          reported_user_id: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["report_category"]
          created_at?: string
          description?: string | null
          id?: string
          reported_message_id?: string | null
          reported_user_id?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_message_id_fkey"
            columns: ["reported_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_events: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          entry_fee: number | null
          event_type: string
          id: string
          image_url: string | null
          max_participants: number | null
          shop_id: string
          starts_at: string
          status: Database["public"]["Enums"]["shop_event_status"]
          tcg: Database["public"]["Enums"]["tcg_type"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          entry_fee?: number | null
          event_type: string
          id?: string
          image_url?: string | null
          max_participants?: number | null
          shop_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["shop_event_status"]
          tcg?: Database["public"]["Enums"]["tcg_type"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          entry_fee?: number | null
          event_type?: string
          id?: string
          image_url?: string | null
          max_participants?: number | null
          shop_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["shop_event_status"]
          tcg?: Database["public"]["Enums"]["tcg_type"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_events_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          payload: Json | null
          read: boolean
          shop_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          read?: boolean
          shop_id: string
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          read?: boolean
          shop_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_notifications_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string
          cover_photo_url: string | null
          created_at: string
          description: string | null
          email: string | null
          hours: Json | null
          id: string
          location: unknown
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          supported_tcgs: Database["public"]["Enums"]["tcg_type"][]
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          address: string
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          hours?: Json | null
          id?: string
          location: unknown
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          supported_tcgs?: Database["public"]["Enums"]["tcg_type"][]
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          address?: string
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          hours?: Json | null
          id?: string
          location?: unknown
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          supported_tcgs?: Database["public"]["Enums"]["tcg_type"][]
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auto_match: boolean
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          email: string
          expo_push_token: string | null
          id: string
          location: unknown
          preferred_tcgs: Database["public"]["Enums"]["tcg_type"][]
          radius_km: number
          rating_score: number
          total_trades: number
          updated_at: string
        }
        Insert: {
          auto_match?: boolean
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name: string
          email: string
          expo_push_token?: string | null
          id: string
          location?: unknown
          preferred_tcgs?: Database["public"]["Enums"]["tcg_type"][]
          radius_km?: number
          rating_score?: number
          total_trades?: number
          updated_at?: string
        }
        Update: {
          auto_match?: boolean
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          email?: string
          expo_push_token?: string | null
          id?: string
          location?: unknown
          preferred_tcgs?: Database["public"]["Enums"]["tcg_type"][]
          radius_km?: number
          rating_score?: number
          total_trades?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_offer_v1: {
        Args: { p_listing_id: string; p_offer_id: string; p_user_id: string }
        Returns: Json
      }
      complete_meetup_v1: {
        Args: { p_meetup_id: string; p_user_id: string }
        Returns: Json
      }
      create_offer_v1: {
        Args: {
          p_cash_amount: number
          p_items: Json
          p_listing_id: string
          p_message: string
          p_offerer_id: string
        }
        Returns: Json
      }
      decline_offer_v1: {
        Args: { p_offer_id: string; p_user_id: string }
        Returns: Json
      }
      expire_listing_v1: {
        Args: { p_listing_id: string; p_user_id: string }
        Returns: Json
      }
      get_unread_counts: {
        Args: { p_user_id: string }
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      is_blocked_between: {
        Args: { p_other_user_id: string }
        Returns: {
          blocked_by_me: boolean
          blocked_by_them: boolean
        }[]
      }
      validate_status_transition: {
        Args: {
          p_allowed: Json
          p_new_status: string
          p_old_status: string
          p_table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      card_condition: "nm" | "lp" | "mp" | "hp" | "dmg"
      listing_status: "active" | "matched" | "completed" | "expired"
      listing_type: "wts" | "wtb" | "wtt"
      match_status: "active" | "completed" | "cancelled"
      meetup_status: "confirmed" | "completed" | "cancelled"
      message_type:
        | "text"
        | "image"
        | "card_offer"
        | "card_offer_response"
        | "meetup_proposal"
        | "meetup_response"
        | "system"
      negotiation_status:
        | "chatting"
        | "offer_pending"
        | "offer_accepted"
        | "meetup_proposed"
        | "meetup_confirmed"
        | "completed"
        | "cancelled"
      offer_status:
        | "pending"
        | "accepted"
        | "declined"
        | "countered"
        | "withdrawn"
      report_category:
        | "inappropriate_content"
        | "scam"
        | "counterfeit"
        | "no_show"
        | "harassment"
        | "other"
      report_status: "pending" | "reviewed" | "resolved"
      shop_event_status: "draft" | "published" | "cancelled" | "completed"
      swipe_direction: "like" | "pass"
      tcg_type: "pokemon" | "mtg" | "yugioh"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      card_condition: ["nm", "lp", "mp", "hp", "dmg"],
      listing_status: ["active", "matched", "completed", "expired"],
      listing_type: ["wts", "wtb", "wtt"],
      match_status: ["active", "completed", "cancelled"],
      meetup_status: ["confirmed", "completed", "cancelled"],
      message_type: [
        "text",
        "image",
        "card_offer",
        "card_offer_response",
        "meetup_proposal",
        "meetup_response",
        "system",
      ],
      negotiation_status: [
        "chatting",
        "offer_pending",
        "offer_accepted",
        "meetup_proposed",
        "meetup_confirmed",
        "completed",
        "cancelled",
      ],
      offer_status: [
        "pending",
        "accepted",
        "declined",
        "countered",
        "withdrawn",
      ],
      report_category: [
        "inappropriate_content",
        "scam",
        "counterfeit",
        "no_show",
        "harassment",
        "other",
      ],
      report_status: ["pending", "reviewed", "resolved"],
      shop_event_status: ["draft", "published", "cancelled", "completed"],
      swipe_direction: ["like", "pass"],
      tcg_type: ["pokemon", "mtg", "yugioh"],
    },
  },
} as const

