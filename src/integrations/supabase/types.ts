export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      wedding_admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          token?: string
        }
        Relationships: []
      }
      wedding_guests: {
        Row: {
          created_at: string
          display_name: string
          greeting: string
          id: string
          notes: string | null
          partner_name: string | null
          party_size: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          greeting: string
          id?: string
          notes?: string | null
          partner_name?: string | null
          party_size?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          greeting?: string
          id?: string
          notes?: string | null
          partner_name?: string | null
          party_size?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      wedding_rsvps: {
        Row: {
          attending: boolean
          dietary_notes: string | null
          first_name: string
          guest_id: string
          id: string
          last_name: string
          meal_choice: string | null
          message: string | null
          partner_first_name: string | null
          partner_last_name: string | null
          partner_meal_choice: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          attending: boolean
          dietary_notes?: string | null
          first_name: string
          guest_id: string
          id?: string
          last_name: string
          meal_choice?: string | null
          message?: string | null
          partner_first_name?: string | null
          partner_last_name?: string | null
          partner_meal_choice?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          attending?: boolean
          dietary_notes?: string | null
          first_name?: string
          guest_id?: string
          id?: string
          last_name?: string
          meal_choice?: string | null
          message?: string | null
          partner_first_name?: string | null
          partner_last_name?: string | null
          partner_meal_choice?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_rsvps_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: true
            referencedRelation: "wedding_guests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_wedding_guest: {
        Args: { _id: string; _token: string }
        Returns: boolean
      }
      admin_list_wedding_guests: {
        Args: { _token: string }
        Returns: {
          created_at: string
          display_name: string
          greeting: string
          id: string
          notes: string
          partner_name: string
          party_size: number
          slug: string
          updated_at: string
        }[]
      }
      admin_list_wedding_rsvps: {
        Args: { _token: string }
        Returns: {
          attending: boolean
          dietary_notes: string
          first_name: string
          guest_display_name: string
          guest_id: string
          id: string
          last_name: string
          meal_choice: string
          message: string
          partner_first_name: string
          partner_last_name: string
          partner_meal_choice: string
          submitted_at: string
          updated_at: string
        }[]
      }
      admin_save_wedding_guest: {
        Args: {
          _display_name: string
          _greeting: string
          _id: string
          _notes: string
          _partner_name: string
          _party_size: number
          _slug: string
          _token: string
        }
        Returns: string
      }
      create_wedding_admin_session: {
        Args: { _password: string }
        Returns: string
      }
      get_wedding_guest: {
        Args: { _slug: string }
        Returns: {
          display_name: string
          greeting: string
          id: string
          partner_name: string
          party_size: number
          slug: string
        }[]
      }
      is_wedding_admin: { Args: { _token: string }; Returns: boolean }
      submit_public_wedding_rsvp: {
        Args: {
          _attending: boolean
          _dietary_notes: string
          _display_name: string
          _first_name: string
          _greeting: string
          _last_name: string
          _meal_choice: string
          _message: string
          _partner_first_name: string
          _partner_last_name: string
          _partner_meal_choice: string
          _party_size: number
          _slug: string
        }
        Returns: string
      }
      submit_wedding_rsvp: {
        Args: {
          _attending: boolean
          _dietary_notes: string
          _first_name: string
          _last_name: string
          _meal_choice: string
          _message: string
          _partner_first_name: string
          _partner_last_name: string
          _partner_meal_choice: string
          _slug: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
