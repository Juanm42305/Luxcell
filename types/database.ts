export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          auth_user_id: string;
          created_at: string;
          id: string;
          role: string;
        };
        ComputedFields: never;
        Insert: {
          auth_user_id: string;
          created_at?: string;
          id?: string;
          role?: string;
        };
        Update: {
          auth_user_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          brand_colors: NonNullable<Json>;
          business_address: string | null;
          business_name: string | null;
          contact_email: string | null;
          description: string | null;
          id: boolean;
          judicial_address: string | null;
          legal_name: string | null;
          logo_path: string | null;
          phone: string | null;
          sales_authorization: string | null;
          slogan: string | null;
          social_media: NonNullable<Json>;
          tax_id: string | null;
          updated_at: string;
          whatsapp_number: string | null;
        };
        ComputedFields: never;
        Insert: {
          brand_colors?: NonNullable<Json>;
          business_address?: string | null;
          business_name?: string | null;
          contact_email?: string | null;
          description?: string | null;
          id?: boolean;
          judicial_address?: string | null;
          legal_name?: string | null;
          logo_path?: string | null;
          phone?: string | null;
          sales_authorization?: string | null;
          slogan?: string | null;
          social_media?: NonNullable<Json>;
          tax_id?: string | null;
          updated_at?: string;
          whatsapp_number?: string | null;
        };
        Update: {
          brand_colors?: NonNullable<Json>;
          business_address?: string | null;
          business_name?: string | null;
          contact_email?: string | null;
          description?: string | null;
          id?: boolean;
          judicial_address?: string | null;
          legal_name?: string | null;
          logo_path?: string | null;
          phone?: string | null;
          sales_authorization?: string | null;
          slogan?: string | null;
          social_media?: NonNullable<Json>;
          tax_id?: string | null;
          updated_at?: string;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      consent_versions: {
        Row: {
          created_at: string;
          effective_from: string;
          notice_text: string;
          version: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          effective_from?: string;
          notice_text: string;
          version: string;
        };
        Update: {
          created_at?: string;
          effective_from?: string;
          notice_text?: string;
          version?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          consent_timestamp: string;
          consent_version: string;
          created_at: string;
          customer_email: string;
          customer_name: string;
          id: string;
          inquiry_number: string;
          inquiry_status: Database["public"]["Enums"]["inquiry_status"];
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          product_id: string | null;
          product_name_snapshot: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          consent_timestamp?: string;
          consent_version: string;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          id?: string;
          inquiry_number?: string;
          inquiry_status?: Database["public"]["Enums"]["inquiry_status"];
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          product_id?: string | null;
          product_name_snapshot?: string | null;
          updated_at?: string;
        };
        Update: {
          consent_timestamp?: string;
          consent_version?: string;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          id?: string;
          inquiry_number?: string;
          inquiry_status?: Database["public"]["Enums"]["inquiry_status"];
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          product_id?: string | null;
          product_name_snapshot?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_consent_version_fkey";
            columns: ["consent_version"];
            isOneToOne: false;
            referencedRelation: "consent_versions";
            referencedColumns: ["version"];
          },
          {
            foreignKeyName: "inquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "catalog_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movements: {
        Row: {
          actor_id: string | null;
          created_at: string;
          id: number;
          product_id: string | null;
          product_name_snapshot: string;
          quantity_delta: number;
          reason: string | null;
          resulting_quantity: number;
        };
        ComputedFields: never;
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          id?: never;
          product_id?: string | null;
          product_name_snapshot: string;
          quantity_delta: number;
          reason?: string | null;
          resulting_quantity: number;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          id?: never;
          product_id?: string | null;
          product_name_snapshot?: string;
          quantity_delta?: number;
          reason?: string | null;
          resulting_quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "catalog_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      pqr_requests: {
        Row: {
          consent_version: string;
          created_at: string;
          description: string;
          due_at: string | null;
          filing_number: string;
          id: string;
          request_type: Database["public"]["Enums"]["pqr_type"];
          requester_email: string;
          requester_name: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["pqr_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          consent_version: string;
          created_at?: string;
          description: string;
          due_at?: string | null;
          filing_number?: string;
          id?: string;
          request_type: Database["public"]["Enums"]["pqr_type"];
          requester_email: string;
          requester_name: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["pqr_status"];
          updated_at?: string;
        };
        Update: {
          consent_version?: string;
          created_at?: string;
          description?: string;
          due_at?: string | null;
          filing_number?: string;
          id?: string;
          request_type?: Database["public"]["Enums"]["pqr_type"];
          requester_email?: string;
          requester_name?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["pqr_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pqr_requests_consent_version_fkey";
            columns: ["consent_version"];
            isOneToOne: false;
            referencedRelation: "consent_versions";
            referencedColumns: ["version"];
          },
        ];
      };
      product_images: {
        Row: {
          alt_text: string;
          created_at: string;
          display_order: number;
          id: string;
          is_primary: boolean;
          product_id: string;
          storage_path: string;
        };
        ComputedFields: never;
        Insert: {
          alt_text: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_primary?: boolean;
          product_id: string;
          storage_path: string;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_primary?: boolean;
          product_id?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "catalog_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand_id: string;
          category_id: string;
          colors: string[];
          condition: Database["public"]["Enums"]["product_condition"];
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          low_stock_threshold: number;
          model: string;
          name: string;
          offer_valid_until: string | null;
          price: number;
          sale_price: number | null;
          short_description: string;
          slug: string;
          specs: NonNullable<Json>;
          stock_quantity: number;
          stock_updated_at: string;
          storage_capacity: string | null;
          updated_at: string;
          warranty_terms: string | null;
        };
        ComputedFields: never;
        Insert: {
          brand_id: string;
          category_id: string;
          colors?: string[];
          condition?: Database["public"]["Enums"]["product_condition"];
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          model: string;
          name: string;
          offer_valid_until?: string | null;
          price: number;
          sale_price?: number | null;
          short_description: string;
          slug: string;
          specs?: NonNullable<Json>;
          stock_quantity?: number;
          stock_updated_at?: string;
          storage_capacity?: string | null;
          updated_at?: string;
          warranty_terms?: string | null;
        };
        Update: {
          brand_id?: string;
          category_id?: string;
          colors?: string[];
          condition?: Database["public"]["Enums"]["product_condition"];
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          model?: string;
          name?: string;
          offer_valid_until?: string | null;
          price?: number;
          sale_price?: number | null;
          short_description?: string;
          slug?: string;
          specs?: NonNullable<Json>;
          stock_quantity?: number;
          stock_updated_at?: string;
          storage_capacity?: string | null;
          updated_at?: string;
          warranty_terms?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "catalog_products";
            referencedColumns: ["brand_id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "catalog_products";
            referencedColumns: ["category_id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      catalog_product_images: {
        Row: {
          alt_text: string;
          display_order: number;
          id: string;
          is_primary: boolean;
          product_id: string;
          storage_path: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "catalog_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      catalog_products: {
        Row: {
          brand_id: string;
          brand_name: string;
          brand_slug: string;
          category_id: string;
          category_name: string;
          category_slug: string;
          colors: string[];
          condition: Database["public"]["Enums"]["product_condition"];
          created_at: string;
          description: string;
          effective_price: number;
          id: string;
          is_featured: boolean;
          model: string;
          name: string;
          offer_valid_until: string | null;
          price: number;
          sale_price: number | null;
          search_text: string | null;
          short_description: string;
          slug: string;
          specs: NonNullable<Json>;
          stock_status: string | null;
          stock_updated_at: string;
          storage_capacity: string | null;
          updated_at: string;
          warranty_terms: string | null;
        };
        ComputedFields: never;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      set_stock_quantity: {
        Args: { p_product_id: string; p_quantity: number; p_reason?: string };
        Returns: number;
      };
    };
    Enums: {
      inquiry_status: "new" | "in_progress" | "closed";
      pqr_status: "received" | "in_progress" | "resolved";
      pqr_type: "peticion" | "queja" | "reclamo" | "datos_personales";
      product_condition: "new" | "display" | "like_new" | "refurbished";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      inquiry_status: ["new", "in_progress", "closed"],
      pqr_status: ["received", "in_progress", "resolved"],
      pqr_type: ["peticion", "queja", "reclamo", "datos_personales"],
      product_condition: ["new", "display", "like_new", "refurbished"],
    },
  },
} as const;
