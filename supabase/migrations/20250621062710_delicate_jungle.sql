-- Lone Town Database Schema

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER,
  photos TEXT[],
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Psychological Profile
  personality_type TEXT,
  emotional_intelligence_score INTEGER DEFAULT 0,
  attachment_style TEXT,
  communication_style TEXT,
  conflict_resolution_style TEXT,
  love_languages TEXT[],
  values TEXT[],
  life_goals TEXT[],
  interests TEXT[],
  
  -- Behavioral Patterns
  response_time_preference TEXT,
  social_energy_level INTEGER DEFAULT 5,
  openness_score INTEGER DEFAULT 50,
  conscientiousness_score INTEGER DEFAULT 50,
  extraversion_score INTEGER DEFAULT 50,
  agreeableness_score INTEGER DEFAULT 50,
  neuroticism_score INTEGER DEFAULT 50,
  
  -- Current State
  current_state TEXT DEFAULT 'onboarding',
  last_active TIMESTAMPTZ DEFAULT now(),
  freeze_until TIMESTAMPTZ,
  match_id UUID
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  pinned_by_user1 BOOLEAN DEFAULT true,
  pinned_by_user2 BOOLEAN DEFAULT true,
  unpinned_by UUID,
  unpinned_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  first_message_at TIMESTAMPTZ,
  video_unlocked BOOLEAN DEFAULT false,
  feedback_sent BOOLEAN DEFAULT false
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Compatibility factors table for analytics
CREATE TABLE compatibility_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  emotional_intelligence_compatibility DECIMAL(3,2),
  personality_compatibility DECIMAL(3,2),
  values_alignment DECIMAL(3,2),
  communication_style_match DECIMAL(3,2),
  life_goals_alignment DECIMAL(3,2),
  interests_overlap DECIMAL(3,2),
  attachment_compatibility DECIMAL(3,2),
  behavioral_compatibility DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User analytics table
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matches_count INTEGER DEFAULT 0,
  successful_matches INTEGER DEFAULT 0,
  average_compatibility_score DECIMAL(3,2),
  total_messages_sent INTEGER DEFAULT 0,
  video_calls_unlocked INTEGER DEFAULT 0,
  reflection_periods INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for matches
CREATE POLICY "Users can read own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can insert matches" ON matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for messages
CREATE POLICY "Users can read messages from their matches" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages to their matches" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- RLS Policies for compatibility factors
CREATE POLICY "Users can read compatibility factors for their matches" ON compatibility_factors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = compatibility_factors.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- RLS Policies for user analytics
CREATE POLICY "Users can read own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update analytics" ON user_analytics
  FOR ALL USING (true);

-- Indexes for better performance
CREATE INDEX idx_users_current_state ON users(current_state);
CREATE INDEX idx_users_freeze_until ON users(freeze_until);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_active = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_last_active_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- Function to automatically unlock video calling
CREATE OR REPLACE FUNCTION check_video_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this match has reached 100 messages and is within 48 hours
  IF (SELECT message_count FROM matches WHERE id = NEW.match_id) >= 100 THEN
    UPDATE matches 
    SET video_unlocked = true 
    WHERE id = NEW.match_id 
    AND first_message_at IS NOT NULL
    AND first_message_at > now() - INTERVAL '48 hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_video_unlock_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_video_unlock();