-- Seed data for badges
-- Generated: 2025-12-11

INSERT INTO public.badges (id, name, description, icon, category, xp_value, sort_order)
VALUES
  -- Kickstart badges (earned by completing daily lessons)
  ('first_listen', 'First Listen', 'You''ve taken the first step', 'musical-notes', 'kickstart', 50, 1),
  ('orchestra_explorer', 'Orchestra Explorer', 'You know the instrumental families', 'people', 'kickstart', 50, 2),
  ('time_traveler', 'Time Traveler', 'You can navigate classical music history', 'time', 'kickstart', 50, 3),
  ('form_finder', 'Form Finder', 'You understand musical architecture', 'grid', 'kickstart', 50, 4),
  ('journey_begun', 'Journey Begun', 'You''ve completed the Kickstart!', 'trophy', 'kickstart', 100, 5),
  
  -- Exploration badges (earned by discovering content)
  ('term_apprentice', 'Term Apprentice', 'Learned 10 glossary terms', 'book', 'exploration', 25, 10),
  ('term_scholar', 'Term Scholar', 'Learned 50 glossary terms', 'library', 'exploration', 100, 11),
  ('term_master', 'Term Master', 'Learned all glossary terms', 'school', 'exploration', 250, 12),
  ('composer_curious', 'Composer Curious', 'Explored 5 composer profiles', 'person', 'exploration', 25, 20),
  ('composer_enthusiast', 'Composer Enthusiast', 'Explored 20 composer profiles', 'people-circle', 'exploration', 100, 21),
  ('era_explorer', 'Era Explorer', 'Learned about all musical eras', 'calendar', 'exploration', 75, 30),
  ('form_student', 'Form Student', 'Studied 5 musical forms', 'document-text', 'exploration', 50, 40),
  
  -- Streak badges
  ('week_warrior', 'Week Warrior', '7-day listening streak', 'flame', 'streak', 100, 50),
  ('month_master', 'Month Master', '30-day listening streak', 'bonfire', 'streak', 500, 51),
  
  -- Milestone badges
  ('early_adopter', 'Early Adopter', 'Joined during beta', 'star', 'milestone', 50, 100),
  ('century_club', 'Century Club', 'Reached 100 XP', 'ribbon', 'milestone', 0, 101),
  ('xp_champion', 'XP Champion', 'Reached 1000 XP', 'medal', 'milestone', 0, 102)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  xp_value = EXCLUDED.xp_value,
  sort_order = EXCLUDED.sort_order;
