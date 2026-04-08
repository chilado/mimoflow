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
      clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          id: string
          last_price: number | null
          min_stock: number
          name: string
          quantity: number
          supplier: string | null
          supplier_contact: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          last_price?: number | null
          min_stock?: number
          name: string
          quantity?: number
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          last_price?: number | null
          min_stock?: number
          name?: string
          quantity?: number
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          art_approved: boolean
          art_notes: string | null
          client_id: string | null
          client_name: string
          created_at: string
          delivery_date: string | null
          event_theme: string
          id: string
          items: Json
          personalization: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          art_approved?: boolean
          art_notes?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          delivery_date?: string | null
          event_theme?: string
          id?: string
          items?: Json
          personalization?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          art_approved?: boolean
          art_notes?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          delivery_date?: string | null
          event_theme?: string
          id?: string
          items?: Json
          personalization?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_configs: {
        Row: {
          default_margin: number
          default_tax_rate: number
          desired_monthly_salary: number
          fixed_costs: Json
          id: string
          monthly_work_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          default_margin?: number
          default_tax_rate?: number
          desired_monthly_salary?: number
          fixed_costs?: Json
          id?: string
          monthly_work_hours?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          default_margin?: number
          default_tax_rate?: number
          desired_monthly_salary?: number
          fixed_costs?: Json
          id?: string
          monthly_work_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_materials: {
        Row: {
          id: string
          material_id: string
          product_id: string
          quantity_used: number
        }
        Insert: {
          id?: string
          material_id: string
          product_id: string
          quantity_used?: number
        }
        Update: {
          id?: string
          material_id?: string
          product_id?: string
          quantity_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          id: string
          images: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          images?: Json
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          images?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          catalog_slug: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          whatsapp: string | null
          instagram: string | null
          address: string | null
          subscription_status: string | null
          subscription_plan: string | null
          subscription_end_date: string | null
          is_blocked: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catalog_slug?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          whatsapp?: string | null
          instagram?: string | null
          address?: string | null
          subscription_status?: string | null
          subscription_plan?: string | null
          subscription_end_date?: string | null
          is_blocked?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          catalog_slug?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          whatsapp?: string | null
          instagram?: string | null
          address?: string | null
          subscription_status?: string | null
          subscription_plan?: string | null
          subscription_end_date?: string | null
          is_blocked?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'trial' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
          status: 'active' | 'cancelled' | 'expired'
          started_at: string
          expires_at: string | null
          cancelled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'trial' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'trial' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description: string
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_product: { Args: { _product_id: string }; Returns: boolean }
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
