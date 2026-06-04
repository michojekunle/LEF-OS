// Hand-written types matching supabase/migrations/*.sql.
// Keep in sync when adding/altering columns.

export type LefDomain = 'law' | 'economics' | 'finance';
export type ReactionKind = 'clap' | 'brain' | 'fire' | 'bookmark';

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  default_public: boolean;
  is_primary_user: boolean;
  created_at: string;
  updated_at: string;
};

export type DailyEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  day_number: number;
  law_completed: boolean;
  economics_completed: boolean;
  finance_completed: boolean;
  study_rating: number | null;
  journal_text: string | null;
  share_insight: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type DayNote = {
  id: string;
  user_id: string;
  day_number: number;
  domain: LefDomain;
  body: string;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  user_id: string;
  day_number: number | null;
  domain: LefDomain | null;
  body: string;
  answered: boolean;
  answer: string | null;
  created_at: string;
  updated_at: string;
};

export type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  note: string | null;
  domain: LefDomain | null;
  day_number: number | null;
  done: boolean;
  created_at: string;
  updated_at: string;
};

export type JournalReaction = {
  id: string;
  entry_id: string;
  user_id: string;
  kind: ReactionKind;
  created_at: string;
};

export type JournalReactionCount = {
  entry_id: string;
  kind: ReactionKind;
  count: number;
};

export type UserStats = {
  days_logged: number;
  law_days: number;
  econ_days: number;
  finance_days: number;
  full_days: number;
  public_insights: number;
  avg_rating: number | null;
  longest_streak: number;
  current_streak: number;
  questions_open: number;
  questions_answered: number;
  bookmarks_total: number;
  bookmarks_done: number;
};

export type SearchHit = {
  id: string;
  user_id: string;
  entry_date: string;
  day_number: number;
  share_insight: string | null;
  is_public: boolean;
  rank: number;
};

export type UserSettings = {
  user_id: string;
  email: string;
  daily_reminder_enabled: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type CustomReminderRow = {
  id: string;
  user_id: string;
  title: string;
  reminder_time: string;
  delivery_type: 'email' | 'in_app' | 'both';
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type InAppNotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type ResourceType = 'video' | 'article' | 'tool' | 'other';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export type ResourceSubmission = {
  id: string;
  day_number: number;
  domain: LefDomain;
  type: ResourceType;
  title: string;
  url: string;
  note: string | null;
  submitted_by: string | null;
  status: SubmissionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type QuestionAnswer = {
  id: string;
  user_id: string;
  day_number: number;
  domain: LefDomain;
  question_index: number;
  answer: string;
  created_at: string;
  updated_at: string;
};

export type ContentFlag = {
  id: string;
  url: string;
  title: string;
  day_number: number | null;
  domain: LefDomain | null;
  content_type: 'video' | 'article';
  flagged_by: string | null;
  reason: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type ResourceFlag = {
  id: string;
  submission_id: string;
  flagged_by: string | null;
  fingerprint: string | null;
  reason: string | null;
  created_at: string;
};

export type AiChatMemoryRow = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  day_context: number | null;
  created_at: string;
};

/**
 * The subscription JSONB column stores the output of PushSubscription.toJSON().
 * The browser's own type (PushSubscriptionJSON) uses optional fields, so we
 * mirror that rather than inventing stricter types that would fail to assign.
 */
export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
  created_at: string;
};

type Insertable<T, OptionalKeys extends keyof T = never> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | OptionalKeys
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
} & Partial<Pick<T, OptionalKeys>>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insertable<
          Profile,
          'username' | 'display_name' | 'bio' | 'avatar_url' | 'default_public' | 'is_primary_user'
        >;
        Update: Partial<Profile>;
        Relationships: [];
      };
      user_settings: {
        Row: UserSettings;
        Insert: Insertable<UserSettings, 'daily_reminder_enabled'>;
        Update: Partial<UserSettings>;
        Relationships: [];
      };
      daily_entries: {
        Row: DailyEntry;
        Insert: Insertable<
          DailyEntry,
          | 'law_completed'
          | 'economics_completed'
          | 'finance_completed'
          | 'study_rating'
          | 'journal_text'
          | 'share_insight'
          | 'is_public'
        >;
        Update: Partial<DailyEntry>;
        Relationships: [];
      };
      day_notes: {
        Row: DayNote;
        Insert: Insertable<DayNote>;
        Update: Partial<DayNote>;
        Relationships: [];
      };
      questions: {
        Row: Question;
        Insert: Insertable<Question, 'day_number' | 'domain' | 'answered' | 'answer'>;
        Update: Partial<Question>;
        Relationships: [];
      };
      bookmarks: {
        Row: Bookmark;
        Insert: Insertable<Bookmark, 'title' | 'note' | 'domain' | 'day_number' | 'done'>;
        Update: Partial<Bookmark>;
        Relationships: [];
      };
      journal_reactions: {
        Row: JournalReaction;
        Insert: Insertable<JournalReaction>;
        Update: Partial<JournalReaction>;
        Relationships: [];
      };
      custom_reminders: {
        Row: CustomReminderRow;
        Insert: Insertable<CustomReminderRow, 'enabled'>;
        Update: Partial<CustomReminderRow>;
        Relationships: [];
      };
      in_app_notifications: {
        Row: InAppNotificationRow;
        Insert: Omit<Insertable<InAppNotificationRow, 'read'>, 'updated_at'>;
        Update: Partial<InAppNotificationRow>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Omit<Insertable<PushSubscriptionRow>, 'updated_at'>;
        Update: Partial<PushSubscriptionRow>;
        Relationships: [];
      };
      ai_chat_memory: {
        Row: AiChatMemoryRow;
        Insert: Omit<Insertable<AiChatMemoryRow, 'day_context'>, 'updated_at'>;
        Update: Partial<AiChatMemoryRow>;
        Relationships: [];
      };
      question_answers: {
        Row: QuestionAnswer;
        Insert: Insertable<QuestionAnswer>;
        Update: Partial<QuestionAnswer>;
        Relationships: [];
      };
      content_flags: {
        Row: ContentFlag;
        Insert: Omit<
          Insertable<
            ContentFlag,
            | 'day_number'
            | 'domain'
            | 'flagged_by'
            | 'reason'
            | 'resolved'
            | 'resolved_by'
            | 'resolved_at'
          >,
          'updated_at'
        >;
        Update: Partial<ContentFlag>;
        Relationships: [];
      };
      resource_flags: {
        Row: ResourceFlag;
        Insert: Omit<
          Insertable<ResourceFlag, 'flagged_by' | 'fingerprint' | 'reason'>,
          'updated_at'
        >;
        Update: never;
        Relationships: [];
      };
      resource_submissions: {
        Row: ResourceSubmission;
        Insert: Omit<
          Insertable<
            ResourceSubmission,
            'type' | 'note' | 'submitted_by' | 'status' | 'reviewed_by' | 'reviewed_at'
          >,
          'updated_at'
        >;
        Update: Partial<ResourceSubmission>;
        Relationships: [];
      };
    };
    Views: {
      journal_reaction_counts: {
        Row: JournalReactionCount;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      search_journal: {
        Args: { q: string; result_limit?: number; result_offset?: number };
        Returns: SearchHit[];
      };
      user_stats: {
        Args: { uid: string };
        Returns: UserStats[];
      };
    };
    Enums: {
      lef_domain: LefDomain;
      reaction_kind: ReactionKind;
      resource_type: ResourceType;
      submission_status: SubmissionStatus;
    };
  };
};
