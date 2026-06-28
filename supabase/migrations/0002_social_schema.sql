-- =============================================================================
-- Hospeda — Social Features
-- Migration: 0002_social_schema.sql
-- Fecha: 2026-06-27
-- Descripcion: Experiencias (posts), likes, comentarios, follows, tags
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLAS SOCIALES
-- ---------------------------------------------------------------------------

-- Experiencias (posts de viaje)
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  location_name TEXT, -- "Pucón, Araucanía"
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photos TEXT[] DEFAULT '{}', -- URLs de fotos
  tags TEXT[] DEFAULT '{}', -- hashtags: pucón, playa, montaña
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes en experiencias
CREATE TABLE IF NOT EXISTS experience_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experience_id, user_id)
);

-- Comentarios en experiencias
CREATE TABLE IF NOT EXISTS experience_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES experience_comments(id) ON DELETE CASCADE, -- respuestas
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes en comentarios
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES experience_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Follows (seguir usuarios)
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Guardados / bookmarks de experiencias
CREATE TABLE IF NOT EXISTS experience_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experience_id, user_id)
);

-- ---------------------------------------------------------------------------
-- INDICES
-- ---------------------------------------------------------------------------
CREATE INDEX idx_experiences_user ON experiences(user_id);
CREATE INDEX idx_experiences_property ON experiences(property_id);
CREATE INDEX idx_experiences_region ON experiences(region);
CREATE INDEX idx_experiences_created ON experiences(created_at DESC);
CREATE INDEX idx_experiences_featured ON experiences(is_featured) WHERE is_featured = true;
CREATE INDEX idx_experiences_tags ON experiences USING GIN(tags);
CREATE INDEX idx_experience_likes_exp ON experience_likes(experience_id);
CREATE INDEX idx_experience_likes_user ON experience_likes(user_id);
CREATE INDEX idx_experience_comments_exp ON experience_comments(experience_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ---------------------------------------------------------------------------
-- CONTADORES (triggers para mantener counts)
-- ---------------------------------------------------------------------------

-- Trigger likes count
CREATE OR REPLACE FUNCTION update_experience_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE experiences SET likes_count = likes_count + 1 WHERE id = NEW.experience_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE experiences SET likes_count = likes_count - 1 WHERE id = OLD.experience_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_experience_likes_count
AFTER INSERT OR DELETE ON experience_likes
FOR EACH ROW EXECUTE FUNCTION update_experience_likes_count();

-- Trigger comments count
CREATE OR REPLACE FUNCTION update_experience_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE experiences SET comments_count = comments_count + 1 WHERE id = NEW.experience_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE experiences SET comments_count = comments_count - 1 WHERE id = OLD.experience_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_experience_comments_count
AFTER INSERT OR DELETE ON experience_comments
FOR EACH ROW EXECUTE FUNCTION update_experience_comments_count();

-- Trigger comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE experience_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE experience_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_likes_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- ---------------------------------------------------------------------------
-- Agregar counters a profiles
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experiences_count INT DEFAULT 0;

-- Trigger follows count
CREATE OR REPLACE FUNCTION update_follows_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_follows_count
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follows_count();

-- Trigger experiences count
CREATE OR REPLACE FUNCTION update_experiences_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET experiences_count = experiences_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET experiences_count = experiences_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_experiences_count
AFTER INSERT OR DELETE ON experiences
FOR EACH ROW EXECUTE FUNCTION update_experiences_count();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_bookmarks ENABLE ROW LEVEL SECURITY;

-- Experiences: anyone can read, owner can CUD
CREATE POLICY "experiences_select" ON experiences FOR SELECT USING (true);
CREATE POLICY "experiences_insert" ON experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "experiences_update" ON experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "experiences_delete" ON experiences FOR DELETE USING (auth.uid() = user_id);

-- Likes: anyone can read, auth users can toggle own
CREATE POLICY "exp_likes_select" ON experience_likes FOR SELECT USING (true);
CREATE POLICY "exp_likes_insert" ON experience_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exp_likes_delete" ON experience_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: anyone can read, auth users can CUD own
CREATE POLICY "exp_comments_select" ON experience_comments FOR SELECT USING (true);
CREATE POLICY "exp_comments_insert" ON experience_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exp_comments_update" ON experience_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exp_comments_delete" ON experience_comments FOR DELETE USING (auth.uid() = user_id);

-- Comment likes
CREATE POLICY "comment_likes_select" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Follows: anyone can read, auth users can toggle own
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Bookmarks: owner only
CREATE POLICY "bookmarks_select" ON experience_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON experience_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON experience_bookmarks FOR DELETE USING (auth.uid() = user_id);
