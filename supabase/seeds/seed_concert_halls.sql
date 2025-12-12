-- Seed data for concert_halls
-- Generated: 2025-12-11T08:34:02.715Z

INSERT INTO public.concert_halls (id, name, city, description, signature_sound, map_url, hero_image, listener_level)
VALUES
  ('musikverein', 'Musikverein (Golden Hall)', 'Vienna, Austria', 'Famed shoebox acoustics—warm, clear, and balanced. Home of the Vienna Philharmonic and the New Year’s Concert broadcast worldwide.', 'Golden glow with natural reverb; strings shimmer without blur.', 'https://maps.google.com/?q=Musikverein%20Vienna', NULL, NULL),
  ('carnegie', 'Carnegie Hall', 'New York, USA', 'Iconic American hall with lively, immediate sound that flatters both orchestras and soloists. A rite of passage for performers.', 'Present and direct—ideal for articulation and attack-heavy music.', 'https://maps.google.com/?q=Carnegie%20Hall%20NYC', NULL, NULL),
  ('elbphilharmonie', 'Elbphilharmonie', 'Hamburg, Germany', 'Dramatic architecture on the harbor with vineyard seating. Crisp, analytical acoustics that reward detailed modern scores.', 'Crystal clarity with precise imaging; bass remains tight even in tuttis.', 'https://maps.google.com/?q=Elbphilharmonie%20Hamburg', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  description = EXCLUDED.description,
  signature_sound = EXCLUDED.signature_sound,
  map_url = EXCLUDED.map_url,
  hero_image = EXCLUDED.hero_image,
  listener_level = EXCLUDED.listener_level;
