-- Enable PostGIS for geospatial indexing
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || LEFT(NEW.id::text, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Photos
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  compass_direction SMALLINT CHECK (compass_direction >= 0 AND compass_direction < 360),
  taken_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  vote_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE USING (auth.uid() = user_id);

-- Indexes for photos
CREATE INDEX idx_photos_location ON photos USING GIST (
  ST_MakePoint(longitude, latitude)
);
CREATE INDEX idx_photos_created ON photos (created_at DESC);
CREATE INDEX idx_photos_votes ON photos (vote_count DESC);
CREATE INDEX idx_photos_user ON photos (user_id);

-- Votes
CREATE TABLE votes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, photo_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own vote"
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update vote_count on photos
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photos SET vote_count = vote_count + 1 WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photos SET vote_count = vote_count - 1 WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
