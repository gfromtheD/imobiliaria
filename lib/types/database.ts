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
      app_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          organization_id: string
          output_image_path: string | null
          parameters: Json
          prompt_version: string
          provider: string
          provider_job_id: string | null
          retry_count: number
          room_id: string
          started_at: string | null
          status: string
          style_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          locked_at?: string | null
          organization_id: string
          output_image_path?: string | null
          parameters?: Json
          prompt_version?: string
          provider?: string
          provider_job_id?: string | null
          retry_count?: number
          room_id: string
          started_at?: string | null
          status?: string
          style_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          locked_at?: string | null
          organization_id?: string
          output_image_path?: string | null
          parameters?: Json
          prompt_version?: string
          provider?: string
          provider_job_id?: string | null
          retry_count?: number
          room_id?: string
          started_at?: string | null
          status?: string
          style_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_jobs: {
        Row: {
          attempt_count: number
          created_at: string
          enqueued_count: number
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json
          result: Json | null
          status: string
          status_history: Json
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          enqueued_count?: number
          error_code?: string | null
          error_message?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          payload?: Json
          result?: Json | null
          status?: string
          status_history?: Json
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          enqueued_count?: number
          error_code?: string | null
          error_message?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          payload?: Json
          result?: Json | null
          status?: string
          status_history?: Json
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      phase0_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          created_at: string
          id: string
          organization_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          organization_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          original_image_path: string | null
          property_id: string
          room_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          original_image_path?: string | null
          property_id: string
          room_type: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          original_image_path?: string | null
          property_id?: string
          room_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      styles: {
        Row: {
          active: boolean
          ai_preset: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          ai_preset: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          ai_preset?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          credits_available: number
          credits_reserved: number
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_available?: number
          credits_reserved?: number
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_available?: number
          credits_reserved?: number
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_ledger: {
        Row: {
          created_at: string
          credits_used: number
          generation_id: string | null
          id: string
          organization_id: string
          provider_cost_estimate: number
          reason: string | null
          status: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          generation_id?: string | null
          id?: string
          organization_id: string
          provider_cost_estimate?: number
          reason?: string | null
          status: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          generation_id?: string | null
          id?: string
          organization_id?: string
          provider_cost_estimate?: number
          reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_ledger_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          organization_id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          organization_id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_generation: { Args: { p_generation_id: string }; Returns: Json }
      claim_generation: { Args: { p_generation_id: string }; Returns: Json }
      claim_job: {
        Args: { p_job_id: string; p_worker?: string }
        Returns: {
          attempt_count: number
          created_at: string
          enqueued_count: number
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json
          result: Json | null
          status: string
          status_history: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "image_jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_generation: {
        Args: {
          p_cost_estimate?: number
          p_generation_id: string
          p_metadata?: Json
          p_output_path: string
          p_provider_job_id: string
        }
        Returns: Json
      }
      complete_job: {
        Args: { p_job_id: string; p_result: Json }
        Returns: {
          attempt_count: number
          created_at: string
          enqueued_count: number
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json
          result: Json | null
          status: string
          status_history: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "image_jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_generation: {
        Args: { p_parameters?: Json; p_room_id: string; p_style_id: string }
        Returns: {
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          organization_id: string
          output_image_path: string | null
          parameters: Json
          prompt_version: string
          provider: string
          provider_job_id: string | null
          retry_count: number
          room_id: string
          started_at: string | null
          status: string
          style_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "generations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_room: {
        Args: {
          p_file_name: string
          p_notes?: string
          p_property_id: string
          p_room_type: string
        }
        Returns: Json
      }
      current_org_id: { Args: never; Returns: string }
      delete_property: { Args: { p_property_id: string }; Returns: boolean }
      fail_generation: {
        Args: {
          p_error_code: string
          p_error_message: string
          p_generation_id: string
          p_retryable?: boolean
        }
        Returns: Json
      }
      fail_job: {
        Args: {
          p_error_code: string
          p_error_message: string
          p_job_id: string
        }
        Returns: {
          attempt_count: number
          created_at: string
          enqueued_count: number
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json
          result: Json | null
          status: string
          status_history: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "image_jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalize_room_upload: {
        Args: { p_room_id: string; p_upload_path: string }
        Returns: {
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          original_image_path: string | null
          property_id: string
          room_type: string
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      process_generation_jobs: { Args: { p_limit?: number }; Returns: number }
      process_jobs: { Args: { p_limit?: number }; Returns: number }
      retry_generation: { Args: { p_generation_id: string }; Returns: Json }
      retry_job: {
        Args: { p_job_id: string }
        Returns: {
          attempt_count: number
          created_at: string
          enqueued_count: number
          error_code: string | null
          error_message: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json
          result: Json | null
          status: string
          status_history: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "image_jobs"
          isOneToOne: true
          isSetofReturn: false
        }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

