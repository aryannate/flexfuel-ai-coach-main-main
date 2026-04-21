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
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      diet_plan_meals: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          diet_plan_id: string
          fats: number
          foods: Json
          id: string
          meal_order: number
          name: string
          protein: number
          time: string
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          diet_plan_id: string
          fats?: number
          foods?: Json
          id?: string
          meal_order?: number
          name: string
          protein?: number
          time: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          diet_plan_id?: string
          fats?: number
          foods?: Json
          id?: string
          meal_order?: number
          name?: string
          protein?: number
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_plan_meals_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          total_calories: number
          trainer_id: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          total_calories?: number
          trainer_id: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          total_calories?: number
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      meal_analysis_results: {
        Row: {
          confidence: number | null
          created_at: string
          foods: Json
          id: string
          meal_type: string | null
          meal_upload_id: string
          micronutrients: Json
          raw_response: Json | null
          suggestions: Json
          totals: Json
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          foods?: Json
          id?: string
          meal_type?: string | null
          meal_upload_id: string
          micronutrients?: Json
          raw_response?: Json | null
          suggestions?: Json
          totals?: Json
        }
        Update: {
          confidence?: number | null
          created_at?: string
          foods?: Json
          id?: string
          meal_type?: string | null
          meal_upload_id?: string
          micronutrients?: Json
          raw_response?: Json | null
          suggestions?: Json
          totals?: Json
        }
        Relationships: [
          {
            foreignKeyName: "meal_analysis_results_meal_upload_id_fkey"
            columns: ["meal_upload_id"]
            isOneToOne: true
            referencedRelation: "meal_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          athlete_id: string
          created_at: string
          date: string
          diet_plan_meal_id: string | null
          id: string
          meal_upload_id: string | null
          notes: string | null
          status: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          date?: string
          diet_plan_meal_id?: string | null
          id?: string
          meal_upload_id?: string | null
          notes?: string | null
          status?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          date?: string
          diet_plan_meal_id?: string | null
          id?: string
          meal_upload_id?: string | null
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_diet_plan_meal_id_fkey"
            columns: ["diet_plan_meal_id"]
            isOneToOne: false
            referencedRelation: "diet_plan_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_logs_meal_upload_id_fkey"
            columns: ["meal_upload_id"]
            isOneToOne: false
            referencedRelation: "meal_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_uploads: {
        Row: {
          athlete_id: string
          created_at: string
          day: string | null
          id: string
          image_url: string | null
          meal_type: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["meal_status"]
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          day?: string | null
          id?: string
          image_url?: string | null
          meal_type?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["meal_status"]
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          day?: string | null
          id?: string
          image_url?: string | null
          meal_type?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["meal_status"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          meal_upload_id: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          meal_upload_id?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          meal_upload_id?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_meal_upload_id_fkey"
            columns: ["meal_upload_id"]
            isOneToOne: false
            referencedRelation: "meal_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coach_id: string | null
          created_at: string
          display_name: string | null
          id: string
          trainer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          coach_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          trainer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          coach_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          trainer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          athlete_id: string
          created_at: string
          day: string
          id: string
          notes: string | null
          target_calories: number
          target_carbs: number
          trainer_id: string
          updated_at: string
          workout_name: string
          workout_type: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          day: string
          id?: string
          notes?: string | null
          target_calories?: number
          target_carbs?: number
          trainer_id: string
          updated_at?: string
          workout_name?: string
          workout_type?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          day?: string
          id?: string
          notes?: string | null
          target_calories?: number
          target_carbs?: number
          trainer_id?: string
          updated_at?: string
          workout_name?: string
          workout_type?: string
        }
        Relationships: []
      }
      streak_data: {
        Row: {
          athlete_id: string
          completed: boolean
          created_at: string
          date: string
          details: string | null
          id: string
        }
        Insert: {
          athlete_id: string
          completed?: boolean
          created_at?: string
          date: string
          details?: string | null
          id?: string
        }
        Update: {
          athlete_id?: string
          completed?: boolean
          created_at?: string
          date?: string
          details?: string | null
          id?: string
        }
        Relationships: []
      }
      trainer_overrides: {
        Row: {
          created_at: string
          edited_foods: Json | null
          edited_totals: Json | null
          id: string
          meal_upload_id: string
          nutrient_notes: Json
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          edited_foods?: Json | null
          edited_totals?: Json | null
          id?: string
          meal_upload_id: string
          nutrient_notes?: Json
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          edited_foods?: Json | null
          edited_totals?: Json | null
          id?: string
          meal_upload_id?: string
          nutrient_notes?: Json
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_overrides_meal_upload_id_fkey"
            columns: ["meal_upload_id"]
            isOneToOne: false
            referencedRelation: "meal_uploads"
            referencedColumns: ["id"]
          },
        ]
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
        water_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          glasses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          glasses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          glasses?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          id: string
          athlete_id: string
          image_url: string
          notes: string | null
          weight: number | null
          created_at: string
        }
        Insert: {
          id?: string
          athlete_id: string
          image_url: string
          notes?: string | null
          weight?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          athlete_id?: string
          image_url?: string
          notes?: string | null
          weight?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "coach" | "trainer" | "athlete"
      meal_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "coach", "trainer", "athlete"],
      meal_status: ["pending", "approved", "rejected"],
    },
  },
} as const
