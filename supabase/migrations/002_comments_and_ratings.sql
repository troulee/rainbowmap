-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) > 0 AND char_length(text) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_photo ON comments (photo_id, created_at ASC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- Ratings table (1-5 stars, one per user per photo)
CREATE TABLE ratings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, photo_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
  ON ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating"
  ON ratings FOR DELETE USING (auth.uid() = user_id);
