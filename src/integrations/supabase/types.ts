export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      anonymous_reports: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          title: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          title?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          attendance_status: string
          attention_level: number | null
          created_at: string
          id: string
          notes: string | null
          recorded_by: string
          session_date: string
          session_title: string | null
          user_id: string
        }
        Insert: {
          attendance_status: string
          attention_level?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by: string
          session_date: string
          session_title?: string | null
          user_id: string
        }
        Update: {
          attendance_status?: string
          attention_level?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string
          session_date?: string
          session_title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          created_by: string
          department: Database["public"]["Enums"]["department_type"] | null
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          created_by: string
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          created_by?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          id: string
          name: string
          participants: string[] | null
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          id?: string
          name: string
          participants?: string[] | null
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          id?: string
          name?: string
          participants?: string[] | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          submitted_by: string | null
          title: string | null
          type: Database["public"]["Enums"]["feedback_type"]
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          submitted_by?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["feedback_type"]
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          submitted_by?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["feedback_type"]
        }
        Relationships: []
      }
      innovation_proposals: {
        Row: {
          created_at: string
          description: string
          id: string
          management_comment: string | null
          status: string | null
          submitted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          management_comment?: string | null
          status?: string | null
          submitted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          management_comment?: string | null
          status?: string | null
          submitted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          message_type: string | null
          room_id: string
          sender_id: string
          voice_duration: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string | null
          room_id: string
          sender_id: string
          voice_duration?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string | null
          room_id?: string
          sender_id?: string
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          email: string
          full_name: string
          id: string
          points: number | null
          position: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          email: string
          full_name: string
          id?: string
          points?: number | null
          position?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          email?: string
          full_name?: string
          id?: string
          points?: number | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          deadline: string | null
          description: string | null
          file_url: string | null
          id: string
          management_feedback: string | null
          status: string | null
          submitted_by: string
          title: string
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          management_feedback?: string | null
          status?: string | null
          submitted_by: string
          title: string
          type: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          management_feedback?: string | null
          status?: string | null
          submitted_by?: string
          title?: string
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          attachments: Json | null
          description: string | null
          feedback: string | null
          id: string
          is_creative_followup: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          submitted_at: string
          submitted_by: string
          task_id: string
        }
        Insert: {
          attachments?: Json | null
          description?: string | null
          feedback?: string | null
          id?: string
          is_creative_followup?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          submitted_at?: string
          submitted_by: string
          task_id: string
        }
        Update: {
          attachments?: Json | null
          description?: string | null
          feedback?: string | null
          id?: string
          is_creative_followup?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          submitted_at?: string
          submitted_by?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string[] | null
          attachments: Json | null
          created_at: string
          created_by: string
          creative_followup: boolean | null
          deadline: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string[] | null
          attachments?: Json | null
          created_at?: string
          created_by: string
          creative_followup?: boolean | null
          deadline?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string[] | null
          attachments?: Json | null
          created_at?: string
          created_by?: string
          creative_followup?: boolean | null
          deadline?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department_type"] | null
          description: string | null
          icon: string | null
          id: string
          name: string
          required_role: Database["public"]["Enums"]["user_role"]
          url: string
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          required_role: Database["public"]["Enums"]["user_role"]
          url: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          required_role?: Database["public"]["Enums"]["user_role"]
          url?: string
        }
        Relationships: []
      }
      training_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string[] | null
          attachments: Json | null
          created_at: string
          deadline: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          assigned_by: string
          assigned_to?: string[] | null
          attachments?: Json | null
          created_at?: string
          deadline?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string[] | null
          attachments?: Json | null
          created_at?: string
          deadline?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      training_submissions: {
        Row: {
          assignment_id: string
          attachments: Json | null
          comments: string | null
          content: string | null
          id: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          assignment_id: string
          attachments?: Json | null
          comments?: string | null
          content?: string | null
          id?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          assignment_id?: string
          attachments?: Json | null
          comments?: string | null
          content?: string | null
          id?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "training_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      department_type:
        | "IT"
        | "Organizing"
        | "Graphic Design"
        | "Public Relations"
        | "Treasury"
        | "Marketing & Social Media"
        | "Content Writing"
        | "HR"
      feedback_type: "high_board_session" | "member_session" | "general"
      report_type: "event_updates" | "financials" | "weekly_progress" | "other"
      task_status:
        | "pending"
        | "submitted"
        | "approved"
        | "rejected"
        | "in_review"
      user_role: "management_board" | "high_board" | "member"
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
      department_type: [
        "IT",
        "Organizing",
        "Graphic Design",
        "Public Relations",
        "Treasury",
        "Marketing & Social Media",
        "Content Writing",
        "HR",
      ],
      feedback_type: ["high_board_session", "member_session", "general"],
      report_type: ["event_updates", "financials", "weekly_progress", "other"],
      task_status: [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "in_review",
      ],
      user_role: ["management_board", "high_board", "member"],
    },
  },
} as const
