-- Seed data for monthly_spotlights
-- Generated: 2025-12-11T08:34:02.714Z

INSERT INTO public.monthly_spotlights (month, type, ref_id, title, subtitle, description, featured_works, challenge)
VALUES
  (1, 'composer', 'bach', 'Johann Sebastian Bach', 'The Foundation of Western Music', 'January we explore the composer who is the foundation of everything that came after. Bach''s mastery of counterpoint, harmony, and form established the grammar of Western classical music.', '{"Goldberg Variations","Mass in B Minor","Brandenburg Concertos"}', 'Listen to one complete Brandenburg Concerto each week'),
  (2, 'era', 'romantic', 'The Romantic Era', 'When Music Became Personal', 'February—the month of love—belongs to the Romantics. This era freed music from courtly restraint and let composers pour out their souls.', '{"Chopin: Nocturnes","Brahms: Symphony No. 3","Wagner: Tristan und Isolde Prelude"}', 'Compare the same emotion expressed by three different Romantic composers'),
  (3, 'composer', 'beethoven', 'Ludwig van Beethoven', 'The Revolutionary', 'March is for revolution—and no composer was more revolutionary than Beethoven. From the Classical elegance of his early works to the radical late quartets, witness music''s transformation.', '{"Symphony No. 5","Symphony No. 9","Piano Sonata No. 14 'Moonlight'"}', 'Listen to symphonies 1, 5, and 9 to hear Beethoven''s evolution'),
  (4, 'era', 'baroque', 'The Baroque Era', 'Ornament, Drama, and Grandeur', 'April brings spring''s ornate blossoms—and the Baroque''s ornate music. Discover the era when opera was born and counterpoint reached its peak.', '{"Vivaldi: The Four Seasons","Handel: Water Music","Bach: Toccata in D minor"}', 'Learn to identify the basso continuo in three different Baroque works'),
  (5, 'composer', 'mozart', 'Wolfgang Amadeus Mozart', 'Divine Grace', 'Mozart''s music sparkles like spring turning to summer. His seeming effortlessness conceals profound depth. This month, we look past the genius myth to the real music.', '{"Symphony No. 40","Piano Concerto No. 21","The Marriage of Figaro"}', 'Compare Mozart''s opera writing with his instrumental writing'),
  (6, 'form', 'symphony', 'The Symphony', 'The Pinnacle of Orchestral Art', 'June celebrates the grandest of forms. From Haydn''s invention through Mahler''s expansion, trace how composers used the symphony to express their deepest thoughts.', '{"Haydn: Symphony No. 94","Beethoven: Symphony No. 6","Brahms: Symphony No. 1"}', 'Listen to the first movements of three symphonies and identify sonata form'),
  (7, 'composer', 'chopin', 'Frédéric Chopin', 'The Poet of the Piano', 'Summer evenings call for Chopin''s nocturnes. The most pianistic of composers created works that seem to breathe and sing.', '{"Nocturne Op. 9 No. 2","Ballade No. 1","Polonaise 'Heroic'"}', 'Listen to nocturnes at different times of day and note how they feel different'),
  (8, 'era', 'modern', 'The Modern Era', 'Breaking All the Rules', 'August heat brings radical change. Explore how 20th-century composers shattered expectations and created entirely new sound worlds.', '{"Stravinsky: The Rite of Spring","Debussy: La Mer","Bartók: Music for Strings"}', 'Listen to one ''difficult'' modern work three times and track how your perception changes'),
  (9, 'composer', 'brahms', 'Johannes Brahms', 'The Romantic Classicist', 'As fall begins, we turn to Brahms'' autumnal warmth. He fused Romantic passion with Classical architecture in works of immense power.', '{"Symphony No. 4","Piano Concerto No. 2","German Requiem"}', 'The Brahms Symphonies Challenge: Listen to all four symphonies this month'),
  (10, 'form', 'opera', 'Opera', 'When Music Tells Stories', 'October''s drama calls for opera. From Mozart''s comedies to Wagner''s myths, discover how composers used voices and orchestra to tell humanity''s greatest stories.', '{"Mozart: Don Giovanni","Verdi: La Traviata","Puccini: La Bohème"}', 'Watch one opera with subtitles—then listen again without visuals'),
  (11, 'composer', 'tchaikovsky', 'Pyotr Ilyich Tchaikovsky', 'Heart on Sleeve', 'November''s approaching holidays bring Tchaikovsky—master of melody and the composer of The Nutcracker. Experience Russian Romanticism at its most direct.', '{"The Nutcracker","Symphony No. 6","Piano Concerto No. 1"}', 'Listen to The Nutcracker while following the story'),
  (12, 'form', 'requiem', 'The Requiem', 'Music for Eternity', 'December invites reflection. The Requiem—music for the dead—is paradoxically some of the most life-affirming music ever written.', '{"Mozart: Requiem","Verdi: Requiem","Brahms: German Requiem"}', 'Listen to all three requiems and compare how each composer approaches mortality')
ON CONFLICT (month) DO UPDATE SET
  type = EXCLUDED.type,
  ref_id = EXCLUDED.ref_id,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  featured_works = EXCLUDED.featured_works,
  challenge = EXCLUDED.challenge;
