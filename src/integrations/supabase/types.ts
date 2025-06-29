export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      biometric_data_enhanced: {
        Row: {
          combined_prediction: number | null
          confidence_score: number | null
          created_at: string | null
          device_id: string | null
          facial_expression: string | null
          facial_prediction: number | null
          gsr_prediction: number | null
          gsr_value: number
          heart_rate: number
          hr_prediction: number | null
          id: number
          session_id: string | null
          stress_level: string
          stress_score: number | null
          temp_prediction: number | null
          temperature: number
          timestamp: string | null
        }
        Insert: {
          combined_prediction?: number | null
          confidence_score?: number | null
          created_at?: string | null
          device_id?: string | null
          facial_expression?: string | null
          facial_prediction?: number | null
          gsr_prediction?: number | null
          gsr_value: number
          heart_rate: number
          hr_prediction?: number | null
          id?: number
          session_id?: string | null
          stress_level?: string
          stress_score?: number | null
          temp_prediction?: number | null
          temperature: number
          timestamp?: string | null
        }
        Update: {
          combined_prediction?: number | null
          confidence_score?: number | null
          created_at?: string | null
          device_id?: string | null
          facial_expression?: string | null
          facial_prediction?: number | null
          gsr_prediction?: number | null
          gsr_value?: number
          heart_rate?: number
          hr_prediction?: number | null
          id?: number
          session_id?: string | null
          stress_level?: string
          stress_score?: number | null
          temp_prediction?: number | null
          temperature?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          accuracy: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          model_name: string
          model_type: string
          model_version: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          model_name: string
          model_type: string
          model_version: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          model_name?: string
          model_type?: string
          model_version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sensor_data: {
        Row: {
          created_at: string
          gsr_value: number | null
          heart_rate: number
          id: string
          temperature: number
          timestamp: string
        }
        Insert: {
          created_at?: string
          gsr_value?: number | null
          heart_rate: number
          id?: string
          temperature: number
          timestamp?: string
        }
        Update: {
          created_at?: string
          gsr_value?: number | null
          heart_rate?: number
          id?: string
          temperature?: number
          timestamp?: string
        }
        Relationships: []
      }
      stress_predictions: {
        Row: {
          confidence: number | null
          id: string
          prediction_timestamp: string
          sensor_data_id: string | null
          stress_level: string
        }
        Insert: {
          confidence?: number | null
          id?: string
          prediction_timestamp?: string
          sensor_data_id?: string | null
          stress_level: string
        }
        Update: {
          confidence?: number | null
          id?: string
          prediction_timestamp?: string
          sensor_data_id?: string | null
          stress_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "stress_predictions_sensor_data_id_fkey"
            columns: ["sensor_data_id"]
            isOneToOne: false
            referencedRelation: "sensor_data"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          completed: boolean | null
          created_at: string | null
          due_date: string | null
          id: string
          priority: string | null
          text: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          text: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          text?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
