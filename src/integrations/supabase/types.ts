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
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          body: string
          canonical_url: string | null
          content_html: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          focus_keyword: string | null
          id: string
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          body?: string
          canonical_url?: string | null
          content_html?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          canonical_url?: string | null
          content_html?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          affiliate_url: string
          author: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          price_label: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          author?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          price_label?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          author?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          price_label?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bug_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          page_url: string | null
          reporter_email: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          page_url?: string | null
          reporter_email?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          page_url?: string | null
          reporter_email?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          long_form: Json | null
          name: string
          noindex: boolean
          og_description: string | null
          og_title: string | null
          seo_description: string | null
          seo_generated_at: string | null
          seo_slug: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          structured_data: Json | null
          twitter_description: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          long_form?: Json | null
          name: string
          noindex?: boolean
          og_description?: string | null
          og_title?: string | null
          seo_description?: string | null
          seo_generated_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          long_form?: Json | null
          name?: string
          noindex?: boolean
          og_description?: string | null
          og_title?: string | null
          seo_description?: string | null
          seo_generated_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          affiliate_url: string
          cover_url: string | null
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean
          id: string
          level: string | null
          price_label: string | null
          provider: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          level?: string | null
          price_label?: string | null
          provider?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          level?: string | null
          price_label?: string | null
          provider?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hidden_items: {
        Row: {
          created_at: string
          id: string
          kind: string
          ref_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          ref_key: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          ref_key?: string
        }
        Relationships: []
      }
      learn_tasks: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          difficulty: string | null
          id: string
          kind: string
          minutes: number | null
          prompt: string | null
          reference_caption: string | null
          reference_url: string | null
          slug: string
          sort_order: number
          steps: string[]
          tagline: string | null
          title: string
          tool_name: string | null
          tool_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          kind: string
          minutes?: number | null
          prompt?: string | null
          reference_caption?: string | null
          reference_url?: string | null
          slug: string
          sort_order?: number
          steps?: string[]
          tagline?: string | null
          title: string
          tool_name?: string | null
          tool_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          kind?: string
          minutes?: number | null
          prompt?: string | null
          reference_caption?: string | null
          reference_url?: string | null
          slug?: string
          sort_order?: number
          steps?: string[]
          tagline?: string | null
          title?: string
          tool_name?: string | null
          tool_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          body: string
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          sort_order: number
          tags: string[]
          title: string
          tool_name: string | null
          tool_url: string | null
          updated_at: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          tags?: string[]
          title: string
          tool_name?: string | null
          tool_url?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          tags?: string[]
          title?: string
          tool_name?: string | null
          tool_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_content: {
        Row: {
          generated_at: string
          id: string
          kind: string
          long_form: Json | null
          model: string | null
          og_description: string | null
          og_title: string | null
          seo_description: string | null
          seo_title: string | null
          slug_path: string
          structured_data: Json | null
          twitter_description: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          generated_at?: string
          id?: string
          kind: string
          long_form?: Json | null
          model?: string | null
          og_description?: string | null
          og_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug_path: string
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          generated_at?: string
          id?: string
          kind?: string
          long_form?: Json | null
          model?: string | null
          og_description?: string | null
          og_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug_path?: string
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_generation_log: {
        Row: {
          completion_tokens: number | null
          created_at: string
          error: string | null
          id: string
          model: string | null
          prompt_tokens: number | null
          status: string
          target_id: string
          target_table: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string
          error?: string | null
          id?: string
          model?: string | null
          prompt_tokens?: number | null
          status: string
          target_id: string
          target_table: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string
          error?: string | null
          id?: string
          model?: string | null
          prompt_tokens?: number | null
          status?: string
          target_id?: string
          target_table?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_slug: string
          created_at: string
          description: string | null
          id: string
          long_form: Json | null
          name: string
          noindex: boolean
          og_description: string | null
          og_title: string | null
          seo_description: string | null
          seo_generated_at: string | null
          seo_slug: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          structured_data: Json | null
          twitter_description: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          description?: string | null
          id?: string
          long_form?: Json | null
          name: string
          noindex?: boolean
          og_description?: string | null
          og_title?: string | null
          seo_description?: string | null
          seo_generated_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          description?: string | null
          id?: string
          long_form?: Json | null
          name?: string
          noindex?: boolean
          og_description?: string | null
          og_title?: string | null
          seo_description?: string | null
          seo_generated_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          structured_data?: Json | null
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tool_comparison_data: {
        Row: {
          api_available: boolean
          company: string | null
          cons: string[]
          created_at: string
          features: Json
          id: string
          integrations: Json
          languages: Json
          launch_year: number | null
          limitations: Json
          media: Json
          metadata: Json
          models: Json
          open_source: boolean
          platforms: Json
          pricing: Json
          pros: string[]
          seo: Json
          source_url: string | null
          status: string | null
          tool_id: string
          updated_at: string
          use_cases: string[]
          verification_note: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          api_available?: boolean
          company?: string | null
          cons?: string[]
          created_at?: string
          features?: Json
          id?: string
          integrations?: Json
          languages?: Json
          launch_year?: number | null
          limitations?: Json
          media?: Json
          metadata?: Json
          models?: Json
          open_source?: boolean
          platforms?: Json
          pricing?: Json
          pros?: string[]
          seo?: Json
          source_url?: string | null
          status?: string | null
          tool_id: string
          updated_at?: string
          use_cases?: string[]
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          api_available?: boolean
          company?: string | null
          cons?: string[]
          created_at?: string
          features?: Json
          id?: string
          integrations?: Json
          languages?: Json
          launch_year?: number | null
          limitations?: Json
          media?: Json
          metadata?: Json
          models?: Json
          open_source?: boolean
          platforms?: Json
          pricing?: Json
          pros?: string[]
          seo?: Json
          source_url?: string | null
          status?: string | null
          tool_id?: string
          updated_at?: string
          use_cases?: string[]
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_comparison_data_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: true
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_comparisons: {
        Row: {
          category_winners: Json
          created_at: string
          faqs: Json
          headline: string | null
          id: string
          intro: string | null
          long_form: Json
          matchup: string
          published: boolean
          quick_summary: Json
          seo_description: string | null
          seo_title: string | null
          slugs: string[]
          updated_at: string
          verdicts: Json
        }
        Insert: {
          category_winners?: Json
          created_at?: string
          faqs?: Json
          headline?: string | null
          id?: string
          intro?: string | null
          long_form?: Json
          matchup: string
          published?: boolean
          quick_summary?: Json
          seo_description?: string | null
          seo_title?: string | null
          slugs?: string[]
          updated_at?: string
          verdicts?: Json
        }
        Update: {
          category_winners?: Json
          created_at?: string
          faqs?: Json
          headline?: string | null
          id?: string
          intro?: string | null
          long_form?: Json
          matchup?: string
          published?: boolean
          quick_summary?: Json
          seo_description?: string | null
          seo_title?: string | null
          slugs?: string[]
          updated_at?: string
          verdicts?: Json
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          logo_url: string | null
          long_form: Json | null
          name: string
          noindex: boolean
          og_description: string | null
          og_title: string | null
          pricing: string | null
          seo_description: string | null
          seo_generated_at: string | null
          seo_slug: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          structured_data: Json | null
          subcategory: string | null
          tagline: string | null
          tags: string[]
          twitter_description: string | null
          twitter_title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          long_form?: Json | null
          name: string
          noindex?: boolean
          og_description?: string | null
          og_title?: string | null
          pricing?: string | null
          seo_description?: string | null
          seo_generated_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          structured_data?: Json | null
          subcategory?: string | null
          tagline?: string | null
          tags?: string[]
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          long_form?: Json | null
          name?: string
          noindex?: boolean
          og_description?: string | null
          og_title?: string | null
          pricing?: string | null
          seo_description?: string | null
          seo_generated_at?: string | null
          seo_slug?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          structured_data?: Json | null
          subcategory?: string | null
          tagline?: string | null
          tags?: string[]
          twitter_description?: string | null
          twitter_title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_admin_invitation: { Args: { _token: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_admin: {
        Args: { _email: string }
        Returns: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        SetofOptions: {
          from: "*"
          to: "admin_invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      list_admins: {
        Args: never
        Returns: {
          email: string
          granted_at: string
          user_id: string
        }[]
      }
      revoke_admin: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "editor" | "moderator"
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
      app_role: ["admin", "super_admin", "editor", "moderator"],
    },
  },
} as const
