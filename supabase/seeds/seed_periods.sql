-- Seed data for periods
-- Generated: 2025-12-11T08:34:02.711Z

INSERT INTO public.periods (id, name, years, description, key_characteristics, color)
VALUES
  ('medieval', 'Medieval', '500-1400', 'The earliest documented music of the Western classical tradition. Characterized by monophonic plainchant and the emergence of polyphony.', '{"Gregorian chant","Sacred music dominance","Modal scales","Organum (early polyphony)"}', '#8B4513'),
  ('renaissance', 'Renaissance', '1400-1600', 'A rebirth of artistic expression with richer polyphony, the rise of secular music, and the printing press enabling wider distribution.', '{"Complex polyphony","Madrigals and motets","Rise of instrumental music","Word painting"}', '#654321'),
  ('baroque', 'Baroque', '1600-1750', 'An era of dramatic expression, ornate melodies, and the birth of opera. Characterized by contrast, movement, and elaborate ornamentation.', '{"Basso continuo","Ornamentation","Terraced dynamics","Fugue and counterpoint","Birth of opera"}', '#B8860B'),
  ('classical', 'Classical', '1750-1820', 'Clarity, balance, and form define this period. The symphony, sonata, and string quartet emerged as primary genres.', '{"Sonata form","Homophonic texture","Clear phrases and cadences","Symphony and concerto development","Alberti bass"}', '#DAA520'),
  ('romantic', 'Romantic', '1820-1900', 'Emotional expression, nationalism, and individualism flourished. Orchestras expanded, and virtuoso performers became stars.', '{"Emotional intensity","Program music","Nationalism","Expanded orchestra","Chromatic harmony","Virtuosity"}', '#DC143C'),
  ('modern', 'Modern', '1900-1975', 'A period of experimentation breaking from tradition. Atonality, serialism, and new timbres challenged conventional harmony.', '{"Atonality","Twelve-tone technique","Polyrhythm","Extended techniques","Electronic elements"}', '#4169E1'),
  ('contemporary', 'Contemporary', '1975-Present', 'A pluralistic era where all styles coexist. Minimalism, neo-romanticism, and electronic fusion define the landscape.', '{"Minimalism","Neo-romanticism","World music fusion","Digital composition","Eclecticism"}', '#9932CC')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  years = EXCLUDED.years,
  description = EXCLUDED.description,
  key_characteristics = EXCLUDED.key_characteristics,
  color = EXCLUDED.color;
