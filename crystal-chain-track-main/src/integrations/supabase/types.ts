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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blockchain_events: {
        Row: {
          actor_address: string
          block_number: number | null
          created_at: string
          event_type: string
          id: string
          network: string
          product_hash: string
          product_id: string
          stage: string
          tx_hash: string
        }
        Insert: {
          actor_address?: string
          block_number?: number | null
          created_at?: string
          event_type: string
          id?: string
          network?: string
          product_hash?: string
          product_id: string
          stage: string
          tx_hash?: string
        }
        Update: {
          actor_address?: string
          block_number?: number | null
          created_at?: string
          event_type?: string
          id?: string
          network?: string
          product_hash?: string
          product_id?: string
          stage?: string
          tx_hash?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          batch_number: string
          blockchain_tx_hash: string | null
          created_at: string
          factory_location: string
          id: string
          image_url: string | null
          manufacturer_id: string
          product_id: string
          product_name: string
          production_date: string
          qr_code_url: string | null
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          batch_number: string
          blockchain_tx_hash?: string | null
          created_at?: string
          factory_location?: string
          id?: string
          image_url?: string | null
          manufacturer_id: string
          product_id: string
          product_name: string
          production_date: string
          qr_code_url?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          batch_number?: string
          blockchain_tx_hash?: string | null
          created_at?: string
          factory_location?: string
          id?: string
          image_url?: string | null
          manufacturer_id?: string
          product_id?: string
          product_name?: string
          production_date?: string
          qr_code_url?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: string
          manufacturer_type: string | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          manufacturer_type?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          manufacturer_type?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      retail_details: {
        Row: {
          created_at: string
          display_notes: string
          id: string
          product_id: string
          retail_price: number | null
          retailer_id: string
          shelf_location: string
          status: string
          storage_conditions: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_notes?: string
          id?: string
          product_id: string
          retail_price?: number | null
          retailer_id: string
          shelf_location?: string
          status?: string
          storage_conditions?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_notes?: string
          id?: string
          product_id?: string
          retail_price?: number | null
          retailer_id?: string
          shelf_location?: string
          status?: string
          storage_conditions?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          created_at: string
          distributor_id: string
          id: string
          product_id: string
          route_notes: string
          shipment_id: string
          status: string
          storage_info: string | null
          temperature_logs: Json
          updated_at: string
          vehicle_info: string
        }
        Insert: {
          created_at?: string
          distributor_id: string
          id?: string
          product_id: string
          route_notes?: string
          shipment_id: string
          status?: string
          storage_info?: string | null
          temperature_logs?: Json
          updated_at?: string
          vehicle_info?: string
        }
        Update: {
          created_at?: string
          distributor_id?: string
          id?: string
          product_id?: string
          route_notes?: string
          shipment_id?: string
          status?: string
          storage_info?: string | null
          temperature_logs?: Json
          updated_at?: string
          vehicle_info?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manufacturer" | "distributor" | "retailer"
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
    Enums: {
      app_role: ["admin", "manufacturer", "distributor", "retailer"],
    },
  },
} as const
