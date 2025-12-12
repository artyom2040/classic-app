-- Seed data for releases
-- Generated: 2025-12-11T08:34:02.714Z

INSERT INTO public.releases (id, title, artist, release_date, description, highlight_track, listener_level, spotify_uri, apple_url, yt_query, image_url)
VALUES
  ('wang-rach-2024', 'Rachmaninoff: Piano Concertos 2 & 3', 'Yuja Wang / Los Angeles Philharmonic / Gustavo Dudamel', '2024-01-19', 'A high-voltage, audiophile-grade take on two Romantic warhorses. The live energy of Wang and Dudamel keeps familiar pages feeling dangerous.', 'Piano Concerto No. 3 — Finale', 'advanced', NULL, NULL, NULL, NULL),
  ('mutter-violin-2024', 'Glass, Williams & Encores', 'Anne-Sophie Mutter / The Mutter Virtuosi', '2024-02-02', 'Newly recorded encores pairing film music with minimalism. Sparkling playing and close-mic engineering make this perfect headphone listening.', 'Philip Glass: Echorus', 'intermediate', NULL, NULL, NULL, NULL),
  ('berlin-mahler-10-2024', 'Mahler: Symphony No. 10 (Cooke III)', 'Berliner Philharmoniker / Sir Simon Rattle', '2024-03-08', 'Rattle revisits Mahler’s final symphony with Berlin. A transparent, modern recording that reveals every line of Cooke’s completion.', 'Adagio — opening viola line and cataclysmic climax', 'advanced', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  artist = EXCLUDED.artist,
  release_date = EXCLUDED.release_date,
  description = EXCLUDED.description,
  highlight_track = EXCLUDED.highlight_track,
  listener_level = EXCLUDED.listener_level,
  spotify_uri = EXCLUDED.spotify_uri,
  apple_url = EXCLUDED.apple_url,
  yt_query = EXCLUDED.yt_query,
  image_url = EXCLUDED.image_url;
