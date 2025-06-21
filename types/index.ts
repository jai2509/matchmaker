export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  location: string;
  created_at: string;
  updated_at: string;
  
  // Psychological Profile
  personality_type: string;
  emotional_intelligence_score: number;
  attachment_style: string;
  communication_style: string;
  conflict_resolution_style: string;
  love_languages: string[];
  values: string[];
  life_goals: string[];
  interests: string[];
  
  // Behavioral Patterns
  response_time_preference: string;
  social_energy_level: number;
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  neuroticism_score: number;
  
  // Current State
  current_state: UserState;
  last_active: string;
  freeze_until?: string;
  match_id?: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  created_at: string;
  status: MatchStatus;
  pinned_by_user1: boolean;
  pinned_by_user2: boolean;
  unpinned_by?: string;
  unpinned_at?: string;
  message_count: number;
  first_message_at?: string;
  video_unlocked: boolean;
  feedback_sent: boolean;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
  read: boolean;
}

export interface CompatibilityFactors {
  emotional_intelligence_compatibility: number;
  personality_compatibility: number;
  values_alignment: number;
  communication_style_match: number;
  life_goals_alignment: number;
  interests_overlap: number;
  attachment_compatibility: number;
  behavioral_compatibility: number;
}

export enum UserState {
  AVAILABLE = 'available',
  MATCHED = 'matched',
  FROZEN = 'frozen',
  ONBOARDING = 'onboarding'
}

export enum MatchStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  EXPIRED = 'expired'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  SYSTEM = 'system'
}

export interface OnboardingData {
  personalInfo: {
    name: string;
    age: number;
    bio: string;
    photos: string[];
    location: string;
  };
  personalityAssessment: {
    answers: Record<string, any>;
    personality_type: string;
    emotional_intelligence_score: number;
    attachment_style: string;
    communication_style: string;
    conflict_resolution_style: string;
    social_energy_level: number;
    big_five_scores: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
  };
  valuesAndGoals: {
    love_languages: string[];
    values: string[];
    life_goals: string[];
    interests: string[];
    response_time_preference: string;
  };
}