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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_configurations: {
        Row: {
          created_at: string | null
          functionality: string
          id: string
          is_active: boolean | null
          is_enabled: boolean | null
          max_tokens: number | null
          model: string
          preset_level: string | null
          service: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          functionality: string
          id?: string
          is_active?: boolean | null
          is_enabled?: boolean | null
          max_tokens?: number | null
          model?: string
          preset_level?: string | null
          service?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          functionality?: string
          id?: string
          is_active?: boolean | null
          is_enabled?: boolean | null
          max_tokens?: number | null
          model?: string
          preset_level?: string | null
          service?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          challenges_faced: string | null
          created_at: string
          goal_achievement_rating: number | null
          id: string
          improvements_noted: string | null
          next_week_goals: string | null
          satisfaction_rating: number | null
          user_id: string
          week_start_date: string
          weight_change: number | null
        }
        Insert: {
          challenges_faced?: string | null
          created_at?: string
          goal_achievement_rating?: number | null
          id?: string
          improvements_noted?: string | null
          next_week_goals?: string | null
          satisfaction_rating?: number | null
          user_id: string
          week_start_date: string
          weight_change?: number | null
        }
        Update: {
          challenges_faced?: string | null
          created_at?: string
          goal_achievement_rating?: number | null
          id?: string
          improvements_noted?: string | null
          next_week_goals?: string | null
          satisfaction_rating?: number | null
          user_id?: string
          week_start_date?: string
          weight_change?: number | null
        }
        Relationships: []
      }
      challenge_participations: {
        Row: {
          best_streak: number | null
          challenge_id: string | null
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          current_streak: number | null
          daily_logs: Json | null
          id: string
          is_completed: boolean | null
          joined_at: string | null
          last_updated: string | null
          notes: string | null
          points_earned: number | null
          progress: number | null
          started_at: string | null
          status: string | null
          target_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_streak?: number | null
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          current_streak?: number | null
          daily_logs?: Json | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          last_updated?: string | null
          notes?: string | null
          points_earned?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_streak?: number | null
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          current_streak?: number | null
          daily_logs?: Json | null
          id?: string
          is_completed?: boolean | null
          joined_at?: string | null
          last_updated?: string | null
          notes?: string | null
          points_earned?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          badge_icon: string | null
          badge_name: string | null
          category: string | null
          challenge_type: string | null
          completion_criteria: Json | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          daily_log_target: number | null
          daily_log_type: string | null
          daily_log_unit: string | null
          description: string | null
          difficulty: string | null
          duration_days: number | null
          end_date: string | null
          entry_fee: number | null
          frequency: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_group_challenge: boolean | null
          max_participants: number | null
          points_reward: number | null
          progress_tracking: Json | null
          requirements: Json | null
          rewards: Json | null
          rules: string | null
          start_date: string | null
          status: string | null
          target_unit: string | null
          target_value: number | null
          tips: string[] | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_icon?: string | null
          badge_name?: string | null
          category?: string | null
          challenge_type?: string | null
          completion_criteria?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          daily_log_target?: number | null
          daily_log_type?: string | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          end_date?: string | null
          entry_fee?: number | null
          frequency?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          max_participants?: number | null
          points_reward?: number | null
          progress_tracking?: Json | null
          requirements?: Json | null
          rewards?: Json | null
          rules?: string | null
          start_date?: string | null
          status?: string | null
          target_unit?: string | null
          target_value?: number | null
          tips?: string[] | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string | null
          category?: string | null
          challenge_type?: string | null
          completion_criteria?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          daily_log_target?: number | null
          daily_log_type?: string | null
          daily_log_unit?: string | null
          description?: string | null
          difficulty?: string | null
          duration_days?: number | null
          end_date?: string | null
          entry_fee?: number | null
          frequency?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_group_challenge?: boolean | null
          max_participants?: number | null
          points_reward?: number | null
          progress_tracking?: Json | null
          requirements?: Json | null
          rewards?: Json | null
          rules?: string | null
          start_date?: string | null
          status?: string | null
          target_unit?: string | null
          target_value?: number | null
          tips?: string[] | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          challenge_id: string | null
          comments: number | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          likes: number | null
          message: string | null
          photo_url: string | null
          updated_at: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          challenge_id?: string | null
          comments?: number | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          likes?: number | null
          message?: string | null
          photo_url?: string | null
          updated_at?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          challenge_id?: string | null
          comments?: number | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          likes?: number | null
          message?: string | null
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      company_data: {
        Row: {
          address: string | null
          company_name: string
          contact_email: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      content_access: {
        Row: {
          access_granted: boolean | null
          content_id: string
          content_type: string
          created_at: string
          expires_at: string | null
          granted_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          access_granted?: boolean | null
          content_id: string
          content_type: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean | null
          content_id?: string
          content_type?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructor_name: string | null
          is_active: boolean | null
          is_premium: boolean | null
          is_published: boolean | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_active?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_active?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_advanced_tracking: {
        Row: {
          bedtime: string | null
          comfort_eating: boolean | null
          created_at: string | null
          daily_score: number | null
          date: string
          day_highlight: string | null
          dreams_remembered: boolean | null
          eating_mindfully: boolean | null
          energy_afternoon: number | null
          energy_evening: number | null
          energy_morning: number | null
          first_drink: string | null
          focus_level: number | null
          goals_achieved: number | null
          gratitude_notes: string | null
          id: string
          improvement_area: string | null
          meals_planned: boolean | null
          meditation_minutes: number | null
          mood_general: number | null
          morning_routine_completed: boolean | null
          personal_growth_moment: string | null
          priorities_set: boolean | null
          reminded_to_drink: number | null
          satisfied_with_food: boolean | null
          sleep_quality_notes: string | null
          steps_current: number | null
          steps_goal: number | null
          stress_triggers: string | null
          tomorrow_intention: string | null
          tracking_completion_percent: number | null
          updated_at: string | null
          user_id: string | null
          wake_up_naturally: boolean | null
          wake_up_time: string | null
          water_current_ml: number | null
          water_goal_ml: number | null
          workout_completed: boolean | null
          workout_enjoyment: number | null
          workout_planned: boolean | null
        }
        Insert: {
          bedtime?: string | null
          comfort_eating?: boolean | null
          created_at?: string | null
          daily_score?: number | null
          date?: string
          day_highlight?: string | null
          dreams_remembered?: boolean | null
          eating_mindfully?: boolean | null
          energy_afternoon?: number | null
          energy_evening?: number | null
          energy_morning?: number | null
          first_drink?: string | null
          focus_level?: number | null
          goals_achieved?: number | null
          gratitude_notes?: string | null
          id?: string
          improvement_area?: string | null
          meals_planned?: boolean | null
          meditation_minutes?: number | null
          mood_general?: number | null
          morning_routine_completed?: boolean | null
          personal_growth_moment?: string | null
          priorities_set?: boolean | null
          reminded_to_drink?: number | null
          satisfied_with_food?: boolean | null
          sleep_quality_notes?: string | null
          steps_current?: number | null
          steps_goal?: number | null
          stress_triggers?: string | null
          tomorrow_intention?: string | null
          tracking_completion_percent?: number | null
          updated_at?: string | null
          user_id?: string | null
          wake_up_naturally?: boolean | null
          wake_up_time?: string | null
          water_current_ml?: number | null
          water_goal_ml?: number | null
          workout_completed?: boolean | null
          workout_enjoyment?: number | null
          workout_planned?: boolean | null
        }
        Update: {
          bedtime?: string | null
          comfort_eating?: boolean | null
          created_at?: string | null
          daily_score?: number | null
          date?: string
          day_highlight?: string | null
          dreams_remembered?: boolean | null
          eating_mindfully?: boolean | null
          energy_afternoon?: number | null
          energy_evening?: number | null
          energy_morning?: number | null
          first_drink?: string | null
          focus_level?: number | null
          goals_achieved?: number | null
          gratitude_notes?: string | null
          id?: string
          improvement_area?: string | null
          meals_planned?: boolean | null
          meditation_minutes?: number | null
          mood_general?: number | null
          morning_routine_completed?: boolean | null
          personal_growth_moment?: string | null
          priorities_set?: boolean | null
          reminded_to_drink?: number | null
          satisfied_with_food?: boolean | null
          sleep_quality_notes?: string | null
          steps_current?: number | null
          steps_goal?: number | null
          stress_triggers?: string | null
          tomorrow_intention?: string | null
          tracking_completion_percent?: number | null
          updated_at?: string | null
          user_id?: string | null
          wake_up_naturally?: boolean | null
          wake_up_time?: string | null
          water_current_ml?: number | null
          water_goal_ml?: number | null
          workout_completed?: boolean | null
          workout_enjoyment?: number | null
          workout_planned?: boolean | null
        }
        Relationships: []
      }
      daily_mission_sessions: {
        Row: {
          completed_sections: string[] | null
          created_at: string | null
          date: string
          id: string
          is_completed: boolean | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_sections?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          is_completed?: boolean | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_sections?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          is_completed?: boolean | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_responses: {
        Row: {
          answer: string
          created_at: string | null
          date: string
          id: string
          points_earned: number | null
          question_id: string
          section: string
          text_response: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          date?: string
          id?: string
          points_earned?: number | null
          question_id: string
          section: string
          text_response?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          date?: string
          id?: string
          points_earned?: number | null
          question_id?: string
          section?: string
          text_response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_sync_log: {
        Row: {
          device_type: string
          error_message: string | null
          id: string
          integration_name: string
          last_sync_date: string | null
          records_synced: number | null
          sync_status: string | null
          sync_type: string
          synced_at: string | null
          user_id: string | null
        }
        Insert: {
          device_type: string
          error_message?: string | null
          id?: string
          integration_name: string
          last_sync_date?: string | null
          records_synced?: number | null
          sync_status?: string | null
          sync_type: string
          synced_at?: string | null
          user_id?: string | null
        }
        Update: {
          device_type?: string
          error_message?: string | null
          id?: string
          integration_name?: string
          last_sync_date?: string | null
          records_synced?: number | null
          sync_status?: string | null
          sync_type?: string
          synced_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exercise_sessions: {
        Row: {
          avg_heart_rate: number | null
          calories_burned: number | null
          created_at: string | null
          device_type: string | null
          distance_km: number | null
          duration_minutes: number
          ended_at: string | null
          exercise_type: string
          id: string
          max_heart_rate: number | null
          min_heart_rate: number | null
          notes: string | null
          started_at: string | null
          steps: number | null
          user_id: string | null
          zones: Json | null
        }
        Insert: {
          avg_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          device_type?: string | null
          distance_km?: number | null
          duration_minutes: number
          ended_at?: string | null
          exercise_type: string
          id?: string
          max_heart_rate?: number | null
          min_heart_rate?: number | null
          notes?: string | null
          started_at?: string | null
          steps?: number | null
          user_id?: string | null
          zones?: Json | null
        }
        Update: {
          avg_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          device_type?: string | null
          distance_km?: number | null
          duration_minutes?: number
          ended_at?: string | null
          exercise_type?: string
          id?: string
          max_heart_rate?: number | null
          min_heart_rate?: number | null
          notes?: string | null
          started_at?: string | null
          steps?: number | null
          user_id?: string | null
          zones?: Json | null
        }
        Relationships: []
      }
      exercise_tracking: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          date: string
          distance_km: number | null
          duration_minutes: number | null
          energy_after: number | null
          exercise_type: string
          id: string
          intensity: string | null
          motivation_level: number | null
          notes: string | null
          recorded_at: string | null
          steps: number | null
          target_achieved: boolean | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          date?: string
          distance_km?: number | null
          duration_minutes?: number | null
          energy_after?: number | null
          exercise_type?: string
          id?: string
          intensity?: string | null
          motivation_level?: number | null
          notes?: string | null
          recorded_at?: string | null
          steps?: number | null
          target_achieved?: boolean | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          date?: string
          distance_km?: number | null
          duration_minutes?: number | null
          energy_after?: number | null
          exercise_type?: string
          id?: string
          intensity?: string | null
          motivation_level?: number | null
          notes?: string | null
          recorded_at?: string | null
          steps?: number | null
          target_achieved?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      food_analysis: {
        Row: {
          created_at: string
          emotional_state: string | null
          food_items: Json
          hunger_after: number | null
          hunger_before: number | null
          id: string
          meal_type: string
          nutrition_analysis: Json
          satisfaction_level: number | null
          sofia_analysis: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_state?: string | null
          food_items: Json
          hunger_after?: number | null
          hunger_before?: number | null
          id?: string
          meal_type: string
          nutrition_analysis: Json
          satisfaction_level?: number | null
          sofia_analysis: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_state?: string | null
          food_items?: Json
          hunger_after?: number | null
          hunger_before?: number | null
          id?: string
          meal_type?: string
          nutrition_analysis?: Json
          satisfaction_level?: number | null
          sofia_analysis?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_patterns: {
        Row: {
          confidence_score: number | null
          context_data: Json | null
          detected_at: string
          id: string
          is_active: boolean | null
          pattern_description: string
          pattern_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          context_data?: Json | null
          detected_at?: string
          id?: string
          is_active?: boolean | null
          pattern_description: string
          pattern_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          context_data?: Json | null
          detected_at?: string
          id?: string
          is_active?: boolean | null
          pattern_description?: string
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_updates: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          new_value: number | null
          notes: string | null
          previous_value: number | null
          update_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          new_value?: number | null
          notes?: string | null
          previous_value?: number | null
          update_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          new_value?: number | null
          notes?: string | null
          previous_value?: number | null
          update_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_updates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_diary: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          exercise_minutes: number | null
          id: string
          mood_rating: number | null
          notes: string | null
          sleep_hours: number | null
          user_id: string
          water_intake: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id: string
          water_intake?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_minutes?: number | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      health_integrations: {
        Row: {
          api_key: string | null
          client_id: string | null
          client_secret: string | null
          config: Json | null
          created_at: string | null
          display_name: string
          enabled: boolean | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          config?: Json | null
          created_at?: string | null
          display_name: string
          enabled?: boolean | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          config?: Json | null
          created_at?: string | null
          display_name?: string
          enabled?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      heart_rate_data: {
        Row: {
          activity_type: string | null
          created_at: string | null
          device_model: string | null
          device_type: string | null
          heart_rate_bpm: number
          heart_rate_variability: number | null
          id: string
          max_hr: number | null
          recorded_at: string | null
          recovery_time: number | null
          resting_hr: number | null
          stress_level: number | null
          user_id: string | null
          zone_time: Json | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          heart_rate_bpm: number
          heart_rate_variability?: number | null
          id?: string
          max_hr?: number | null
          recorded_at?: string | null
          recovery_time?: number | null
          resting_hr?: number | null
          stress_level?: number | null
          user_id?: string | null
          zone_time?: Json | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          device_model?: string | null
          device_type?: string | null
          heart_rate_bpm?: number
          heart_rate_variability?: number | null
          id?: string
          max_hr?: number | null
          recorded_at?: string | null
          recovery_time?: number | null
          resting_hr?: number | null
          stress_level?: number | null
          user_id?: string | null
          zone_time?: Json | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          module_id: string
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          module_id: string
          order_index: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          module_id?: string
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      mood_tracking: {
        Row: {
          anxiety_level: number | null
          created_at: string | null
          date: string
          day_rating: number | null
          energy_level: number | null
          gratitude_text: string | null
          id: string
          mood_notes: string | null
          recorded_at: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          anxiety_level?: number | null
          created_at?: string | null
          date?: string
          day_rating?: number | null
          energy_level?: number | null
          gratitude_text?: string | null
          id?: string
          mood_notes?: string | null
          recorded_at?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          anxiety_level?: number | null
          created_at?: string | null
          date?: string
          day_rating?: number | null
          energy_level?: number | null
          gratitude_text?: string | null
          id?: string
          mood_notes?: string | null
          recorded_at?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      preventive_health_analyses: {
        Row: {
          analysis_data: Json | null
          analysis_type: string
          created_at: string | null
          id: string
          recommendations: Json | null
          risk_factors: Json | null
          risk_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_data?: Json | null
          analysis_type: string
          created_at?: string | null
          id?: string
          recommendations?: Json | null
          risk_factors?: Json | null
          risk_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json | null
          analysis_type?: string
          created_at?: string | null
          id?: string
          recommendations?: Json | null
          risk_factors?: Json | null
          risk_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: string[] | null
          admin_level: string | null
          age: number | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          goals: string[] | null
          id: string
          phone: string | null
          postal_code: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          admin_level?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          admin_level?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          goals?: string[] | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_time: number | null
          follow_up_questions: string[] | null
          id: string
          is_active: boolean | null
          materials_needed: string[] | null
          target_saboteurs: string[] | null
          title: string
          tools_data: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: number | null
          follow_up_questions?: string[] | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          target_saboteurs?: string[] | null
          title: string
          tools_data?: Json | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: number | null
          follow_up_questions?: string[] | null
          id?: string
          is_active?: boolean | null
          materials_needed?: string[] | null
          target_saboteurs?: string[] | null
          title?: string
          tools_data?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sleep_tracking: {
        Row: {
          bedtime: string | null
          created_at: string | null
          date: string
          hours_slept: number
          id: string
          recorded_at: string | null
          sleep_notes: string | null
          sleep_quality: number | null
          source: string | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string | null
          date?: string
          hours_slept: number
          id?: string
          recorded_at?: string | null
          sleep_notes?: string | null
          sleep_quality?: number | null
          source?: string | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string | null
          date?: string
          hours_slept?: number
          id?: string
          recorded_at?: string | null
          sleep_notes?: string | null
          sleep_quality?: number | null
          source?: string | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      sofia_conversations: {
        Row: {
          context_data: Json | null
          conversation_date: string | null
          created_at: string | null
          food_analysis: Json | null
          id: string
          image_url: string | null
          message_type: string | null
          sofia_response: string | null
          user_id: string
          user_message: string | null
        }
        Insert: {
          context_data?: Json | null
          conversation_date?: string | null
          created_at?: string | null
          food_analysis?: Json | null
          id?: string
          image_url?: string | null
          message_type?: string | null
          sofia_response?: string | null
          user_id: string
          user_message?: string | null
        }
        Update: {
          context_data?: Json | null
          conversation_date?: string | null
          created_at?: string | null
          food_analysis?: Json | null
          id?: string
          image_url?: string | null
          message_type?: string | null
          sofia_response?: string | null
          user_id?: string
          user_message?: string | null
        }
        Relationships: []
      }
      subscription_invoices: {
        Row: {
          amount: number
          asaas_payment_id: string | null
          bank_slip_url: string | null
          created_at: string
          due_date: string
          id: string
          invoice_url: string | null
          paid_date: string | null
          payment_method: string | null
          pix_qr_code: string | null
          status: string | null
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          asaas_payment_id?: string | null
          bank_slip_url?: string | null
          created_at?: string
          due_date: string
          id?: string
          invoice_url?: string | null
          paid_date?: string | null
          payment_method?: string | null
          pix_qr_code?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string | null
          bank_slip_url?: string | null
          created_at?: string
          due_date?: string
          id?: string
          invoice_url?: string | null
          paid_date?: string | null
          payment_method?: string | null
          pix_qr_code?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          interval_count: number | null
          interval_type: string | null
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_count?: number | null
          interval_type?: string | null
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_count?: number | null
          interval_type?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      tracking_achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          current_value: number | null
          description: string | null
          icon: string | null
          id: string
          is_milestone: boolean | null
          points_earned: number | null
          streak_days: number | null
          target_value: number | null
          title: string
          tracking_category: string
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          current_value?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_milestone?: boolean | null
          points_earned?: number | null
          streak_days?: number | null
          target_value?: number | null
          title: string
          tracking_category: string
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          current_value?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_milestone?: boolean | null
          points_earned?: number | null
          streak_days?: number | null
          target_value?: number | null
          title?: string
          tracking_category?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          progress: number | null
          target: number | null
          title: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          title: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          progress?: number | null
          target?: number | null
          title?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_anamnesis: {
        Row: {
          biggest_weight_loss_challenge: string | null
          chronic_diseases: Json | null
          city_state: string | null
          completed_at: string | null
          compulsive_eating_situations: string | null
          created_at: string | null
          current_bmi: number | null
          current_medications: Json | null
          current_weight: number | null
          daily_energy_level: number | null
          daily_stress_level: number | null
          eats_in_secret: boolean | null
          eats_until_uncomfortable: boolean | null
          emotional_events_during_weight_gain: string | null
          family_depression_anxiety_history: boolean | null
          family_diabetes_history: boolean | null
          family_eating_disorders_history: boolean | null
          family_heart_disease_history: boolean | null
          family_obesity_history: boolean | null
          family_other_chronic_diseases: string | null
          family_thyroid_problems_history: boolean | null
          feels_guilt_after_eating: boolean | null
          food_relationship_score: number | null
          forbidden_foods: Json | null
          general_quality_of_life: number | null
          had_rebound_effect: boolean | null
          has_compulsive_eating: boolean | null
          height_cm: number | null
          herbal_medicines: Json | null
          highest_adult_weight: number | null
          how_found_method: string | null
          id: string
          ideal_weight_goal: number | null
          least_effective_treatment: string | null
          lowest_adult_weight: number | null
          main_treatment_goals: string | null
          major_weight_gain_periods: string | null
          marital_status: string | null
          most_effective_treatment: string | null
          motivation_for_seeking_treatment: string | null
          physical_activity_frequency: string | null
          physical_activity_type: string | null
          previous_weight_treatments: Json | null
          problematic_foods: Json | null
          profession: string | null
          sleep_hours_per_night: number | null
          sleep_quality_score: number | null
          supplements: Json | null
          timeframe_to_achieve_goal: string | null
          treatment_success_definition: string | null
          updated_at: string | null
          user_id: string
          weight_fluctuation_classification: string | null
          weight_gain_started_age: number | null
        }
        Insert: {
          biggest_weight_loss_challenge?: string | null
          chronic_diseases?: Json | null
          city_state?: string | null
          completed_at?: string | null
          compulsive_eating_situations?: string | null
          created_at?: string | null
          current_bmi?: number | null
          current_medications?: Json | null
          current_weight?: number | null
          daily_energy_level?: number | null
          daily_stress_level?: number | null
          eats_in_secret?: boolean | null
          eats_until_uncomfortable?: boolean | null
          emotional_events_during_weight_gain?: string | null
          family_depression_anxiety_history?: boolean | null
          family_diabetes_history?: boolean | null
          family_eating_disorders_history?: boolean | null
          family_heart_disease_history?: boolean | null
          family_obesity_history?: boolean | null
          family_other_chronic_diseases?: string | null
          family_thyroid_problems_history?: boolean | null
          feels_guilt_after_eating?: boolean | null
          food_relationship_score?: number | null
          forbidden_foods?: Json | null
          general_quality_of_life?: number | null
          had_rebound_effect?: boolean | null
          has_compulsive_eating?: boolean | null
          height_cm?: number | null
          herbal_medicines?: Json | null
          highest_adult_weight?: number | null
          how_found_method?: string | null
          id?: string
          ideal_weight_goal?: number | null
          least_effective_treatment?: string | null
          lowest_adult_weight?: number | null
          main_treatment_goals?: string | null
          major_weight_gain_periods?: string | null
          marital_status?: string | null
          most_effective_treatment?: string | null
          motivation_for_seeking_treatment?: string | null
          physical_activity_frequency?: string | null
          physical_activity_type?: string | null
          previous_weight_treatments?: Json | null
          problematic_foods?: Json | null
          profession?: string | null
          sleep_hours_per_night?: number | null
          sleep_quality_score?: number | null
          supplements?: Json | null
          timeframe_to_achieve_goal?: string | null
          treatment_success_definition?: string | null
          updated_at?: string | null
          user_id: string
          weight_fluctuation_classification?: string | null
          weight_gain_started_age?: number | null
        }
        Update: {
          biggest_weight_loss_challenge?: string | null
          chronic_diseases?: Json | null
          city_state?: string | null
          completed_at?: string | null
          compulsive_eating_situations?: string | null
          created_at?: string | null
          current_bmi?: number | null
          current_medications?: Json | null
          current_weight?: number | null
          daily_energy_level?: number | null
          daily_stress_level?: number | null
          eats_in_secret?: boolean | null
          eats_until_uncomfortable?: boolean | null
          emotional_events_during_weight_gain?: string | null
          family_depression_anxiety_history?: boolean | null
          family_diabetes_history?: boolean | null
          family_eating_disorders_history?: boolean | null
          family_heart_disease_history?: boolean | null
          family_obesity_history?: boolean | null
          family_other_chronic_diseases?: string | null
          family_thyroid_problems_history?: boolean | null
          feels_guilt_after_eating?: boolean | null
          food_relationship_score?: number | null
          forbidden_foods?: Json | null
          general_quality_of_life?: number | null
          had_rebound_effect?: boolean | null
          has_compulsive_eating?: boolean | null
          height_cm?: number | null
          herbal_medicines?: Json | null
          highest_adult_weight?: number | null
          how_found_method?: string | null
          id?: string
          ideal_weight_goal?: number | null
          least_effective_treatment?: string | null
          lowest_adult_weight?: number | null
          main_treatment_goals?: string | null
          major_weight_gain_periods?: string | null
          marital_status?: string | null
          most_effective_treatment?: string | null
          motivation_for_seeking_treatment?: string | null
          physical_activity_frequency?: string | null
          physical_activity_type?: string | null
          previous_weight_treatments?: Json | null
          problematic_foods?: Json | null
          profession?: string | null
          sleep_hours_per_night?: number | null
          sleep_quality_score?: number | null
          supplements?: Json | null
          timeframe_to_achieve_goal?: string | null
          treatment_success_definition?: string | null
          updated_at?: string | null
          user_id?: string
          weight_fluctuation_classification?: string | null
          weight_gain_started_age?: number | null
        }
        Relationships: []
      }
      user_favorite_foods: {
        Row: {
          created_at: string
          food_category: string
          food_name: string
          id: string
          last_used: string | null
          nutrition_data: Json | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          food_category: string
          food_name: string
          id?: string
          last_used?: string | null
          nutrition_data?: Json | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          food_category?: string
          food_name?: string
          id?: string
          last_used?: string | null
          nutrition_data?: Json | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          challenge_id: string | null
          created_at: string | null
          current_value: number | null
          data_fim: string | null
          data_inicio: string | null
          description: string | null
          difficulty: string | null
          estimated_points: number | null
          evidence_required: boolean | null
          final_points: number | null
          gordura_corporal_meta_percent: number | null
          id: string
          imc_meta: number | null
          is_group_goal: boolean | null
          last_tracked_date: string | null
          peso_meta_kg: number | null
          points_awarded: number | null
          rejection_reason: string | null
          status: string | null
          streak_days: number | null
          target_daily_value: number | null
          target_date: string | null
          target_value: number | null
          title: string | null
          tracking_type: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_points?: number | null
          evidence_required?: boolean | null
          final_points?: number | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          is_group_goal?: boolean | null
          last_tracked_date?: string | null
          peso_meta_kg?: number | null
          points_awarded?: number | null
          rejection_reason?: string | null
          status?: string | null
          streak_days?: number | null
          target_daily_value?: number | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          tracking_type?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          challenge_id?: string | null
          created_at?: string | null
          current_value?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_points?: number | null
          evidence_required?: boolean | null
          final_points?: number | null
          gordura_corporal_meta_percent?: number | null
          id?: string
          imc_meta?: number | null
          is_group_goal?: boolean | null
          last_tracked_date?: string | null
          peso_meta_kg?: number | null
          points_awarded?: number | null
          rejection_reason?: string | null
          status?: string | null
          streak_days?: number | null
          target_daily_value?: number | null
          target_date?: string | null
          target_value?: number | null
          title?: string | null
          tracking_type?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string | null
          date_assigned: string
          id: string
          is_completed: boolean | null
          mission_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          date_assigned?: string
          id?: string
          is_completed?: boolean | null
          mission_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          date_assigned?: string
          id?: string
          is_completed?: boolean | null
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_physical_data: {
        Row: {
          altura_cm: number
          created_at: string | null
          id: string
          idade: number
          nivel_atividade: string | null
          sexo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          altura_cm: number
          created_at?: string | null
          id?: string
          idade: number
          nivel_atividade?: string | null
          sexo: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          altura_cm?: number
          created_at?: string | null
          id?: string
          idade?: number
          nivel_atividade?: string | null
          sexo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          feedback: Json | null
          id: string
          notes: string | null
          progress: number | null
          session_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          notes?: string | null
          progress?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          feedback?: Json | null
          id?: string
          notes?: string | null
          progress?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          asaas_customer_id: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asaas_customer_id?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asaas_customer_id?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      water_tracking: {
        Row: {
          amount_ml: number
          created_at: string | null
          date: string
          id: string
          notes: string | null
          recorded_at: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          recorded_at?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          recorded_at?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_analyses: {
        Row: {
          created_at: string | null
          id: string
          media_imc: number | null
          observacoes: string | null
          peso_final: number | null
          peso_inicial: number | null
          semana_fim: string
          semana_inicio: string
          tendencia: string | null
          user_id: string | null
          variacao_gordura_corporal: number | null
          variacao_massa_muscular: number | null
          variacao_peso: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_imc?: number | null
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
          semana_fim: string
          semana_inicio: string
          tendencia?: string | null
          user_id?: string | null
          variacao_gordura_corporal?: number | null
          variacao_massa_muscular?: number | null
          variacao_peso?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_imc?: number | null
          observacoes?: string | null
          peso_final?: number | null
          peso_inicial?: number | null
          semana_fim?: string
          semana_inicio?: string
          tendencia?: string | null
          user_id?: string | null
          variacao_gordura_corporal?: number | null
          variacao_massa_muscular?: number | null
          variacao_peso?: number | null
        }
        Relationships: []
      }
      weekly_health_reports: {
        Row: {
          created_at: string | null
          dr_vital_analysis: string | null
          generated_at: string | null
          health_score: number | null
          id: string
          recommendations: Json | null
          report_data: Json
          sent_at: string | null
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          dr_vital_analysis?: string | null
          generated_at?: string | null
          health_score?: number | null
          id?: string
          recommendations?: Json | null
          report_data?: Json
          sent_at?: string | null
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          dr_vital_analysis?: string | null
          generated_at?: string | null
          health_score?: number | null
          id?: string
          recommendations?: Json | null
          report_data?: Json
          sent_at?: string | null
          user_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      weekly_insights: {
        Row: {
          average_energy: number | null
          average_mood: number | null
          average_stress: number | null
          created_at: string | null
          exercise_frequency: number | null
          id: string
          most_common_gratitude: string | null
          sleep_consistency: number | null
          streak_days: number | null
          total_points: number | null
          user_id: string | null
          water_consistency: number | null
          week_start_date: string
        }
        Insert: {
          average_energy?: number | null
          average_mood?: number | null
          average_stress?: number | null
          created_at?: string | null
          exercise_frequency?: number | null
          id?: string
          most_common_gratitude?: string | null
          sleep_consistency?: number | null
          streak_days?: number | null
          total_points?: number | null
          user_id?: string | null
          water_consistency?: number | null
          week_start_date: string
        }
        Update: {
          average_energy?: number | null
          average_mood?: number | null
          average_stress?: number | null
          created_at?: string | null
          exercise_frequency?: number | null
          id?: string
          most_common_gratitude?: string | null
          sleep_consistency?: number | null
          streak_days?: number | null
          total_points?: number | null
          user_id?: string | null
          water_consistency?: number | null
          week_start_date?: string
        }
        Relationships: []
      }
      weighings: {
        Row: {
          basal_metabolism: number | null
          bmi: number | null
          body_fat: number | null
          body_water: number | null
          bone_mass: number | null
          created_at: string
          device_type: string | null
          id: string
          metabolic_age: number | null
          muscle_mass: number | null
          user_id: string
          weight: number
        }
        Insert: {
          basal_metabolism?: number | null
          bmi?: number | null
          body_fat?: number | null
          body_water?: number | null
          bone_mass?: number | null
          created_at?: string
          device_type?: string | null
          id?: string
          metabolic_age?: number | null
          muscle_mass?: number | null
          user_id: string
          weight: number
        }
        Update: {
          basal_metabolism?: number | null
          bmi?: number | null
          body_fat?: number | null
          body_water?: number | null
          bone_mass?: number | null
          created_at?: string
          device_type?: string | null
          id?: string
          metabolic_age?: number | null
          muscle_mass?: number | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      weight_measurements: {
        Row: {
          agua_corporal_percent: number | null
          body_fat_percent: number | null
          bone_mass_kg: number | null
          circunferencia_abdominal_cm: number | null
          circunferencia_braco_cm: number | null
          circunferencia_perna_cm: number | null
          created_at: string | null
          device_type: string | null
          gordura_corporal_percent: number | null
          gordura_visceral: number | null
          id: string
          idade_metabolica: number | null
          imc: number | null
          massa_muscular_kg: number | null
          measurement_date: string | null
          metabolic_age: number | null
          metabolismo_basal_kcal: number | null
          muscle_mass_kg: number | null
          notes: string | null
          osso_kg: number | null
          peso_kg: number
          risco_metabolico: string | null
          user_id: string | null
          visceral_fat_level: number | null
          water_percent: number | null
        }
        Insert: {
          agua_corporal_percent?: number | null
          body_fat_percent?: number | null
          bone_mass_kg?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_perna_cm?: number | null
          created_at?: string | null
          device_type?: string | null
          gordura_corporal_percent?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          measurement_date?: string | null
          metabolic_age?: number | null
          metabolismo_basal_kcal?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          osso_kg?: number | null
          peso_kg: number
          risco_metabolico?: string | null
          user_id?: string | null
          visceral_fat_level?: number | null
          water_percent?: number | null
        }
        Update: {
          agua_corporal_percent?: number | null
          body_fat_percent?: number | null
          bone_mass_kg?: number | null
          circunferencia_abdominal_cm?: number | null
          circunferencia_braco_cm?: number | null
          circunferencia_perna_cm?: number | null
          created_at?: string | null
          device_type?: string | null
          gordura_corporal_percent?: number | null
          gordura_visceral?: number | null
          id?: string
          idade_metabolica?: number | null
          imc?: number | null
          massa_muscular_kg?: number | null
          measurement_date?: string | null
          metabolic_age?: number | null
          metabolismo_basal_kcal?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          osso_kg?: number | null
          peso_kg?: number
          risco_metabolico?: string | null
          user_id?: string | null
          visceral_fat_level?: number | null
          water_percent?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_goal: {
        Args: { goal_id: string; admin_user_id: string; admin_notes?: string }
        Returns: Json
      }
      calculate_daily_tracking_score: {
        Args: { p_user_id: string; p_date: string }
        Returns: number
      }
      calculate_heart_rate_zones: {
        Args: { age: number; resting_hr?: number }
        Returns: Json
      }
      calculate_weekly_health_score: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: number
      }
      reject_goal: {
        Args: {
          goal_id: string
          admin_user_id: string
          rejection_reason: string
          admin_notes?: string
        }
        Returns: Json
      }
      sync_device_data: {
        Args: {
          p_user_id: string
          p_integration_name: string
          p_device_type: string
          p_data: Json
        }
        Returns: number
      }
      user_has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      user_has_content_access: {
        Args: {
          user_uuid: string
          content_type_param: string
          content_id_param: string
        }
        Returns: boolean
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
