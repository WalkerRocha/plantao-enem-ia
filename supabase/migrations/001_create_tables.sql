
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('Silver', 'Gold')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contents table for uploaded materials
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  content_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create essay_corrections table
CREATE TABLE essay_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  essay_text TEXT NOT NULL,
  score INTEGER,
  grade TEXT,
  feedback JSONB,
  competencies JSONB,
  suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for subscribers
CREATE POLICY "Users can view own subscription" ON subscribers
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for contents (admins can manage, users can view)
CREATE POLICY "Everyone can view contents" ON contents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert contents" ON contents
  FOR INSERT TO authenticated WITH CHECK (
    auth.email() IN ('admin@plantaoenem.com', 'administrador@plantaoenem.com')
  );

CREATE POLICY "Admins can update contents" ON contents
  FOR UPDATE TO authenticated USING (
    auth.email() IN ('admin@plantaoenem.com', 'administrador@plantaoenem.com')
  );

CREATE POLICY "Admins can delete contents" ON contents
  FOR DELETE TO authenticated USING (
    auth.email() IN ('admin@plantaoenem.com', 'administrador@plantaoenem.com')
  );

-- RLS Policies for essay_corrections
CREATE POLICY "Users can view own corrections" ON essay_corrections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own corrections" ON essay_corrections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for content files
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', false);

-- Storage policies
CREATE POLICY "Authenticated users can view content files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'content');

CREATE POLICY "Admins can upload content files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'content' AND 
    auth.email() IN ('admin@plantaoenem.com', 'administrador@plantaoenem.com')
  );

CREATE POLICY "Admins can update content files" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'content' AND 
    auth.email() IN ('admin@plantaoenem.com', 'administrador@plantaoenem.com')
  );

CREATE POLICY "Admins can delete content files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'content' AND 
    auth.email() IN ('admin@plantaoenem.com', 'administrador@plantaoenem.com')
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_subscribers_user_id ON subscribers(user_id);
CREATE INDEX idx_subscribers_stripe_customer_id ON subscribers(stripe_customer_id);
CREATE INDEX idx_contents_subject ON contents(subject);
CREATE INDEX idx_contents_content_type ON contents(content_type);
CREATE INDEX idx_essay_corrections_user_id ON essay_corrections(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
