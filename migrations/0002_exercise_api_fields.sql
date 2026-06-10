ALTER TABLE exercise
  ADD COLUMN video_url text,
  ADD COLUMN overview text,
  ADD COLUMN exercise_tips text[] NOT NULL DEFAULT '{}',
  ADD COLUMN variations text[] NOT NULL DEFAULT '{}',
  ADD COLUMN keywords text[] NOT NULL DEFAULT '{}';
