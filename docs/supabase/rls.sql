-- Public read policies for published content
create policy "Public read releases" on public.releases for select using (true);
create policy "Public read concert halls" on public.concert_halls for select using (true);
create policy "Public read terms" on public.terms for select using (true);
create policy "Public read periods" on public.periods for select using (true);
create policy "Public read forms" on public.forms for select using (true);
create policy "Public read composers" on public.composers for select using (true);
create policy "Public read monthly spotlights" on public.monthly_spotlights for select using (true);
create policy "Public read weekly albums" on public.weekly_albums for select using (true);
create policy "Public read homepage blocks" on public.homepage_blocks for select using (true);
create policy "Public read news posts" on public.news_posts for select using (true);
create policy "Public read tags" on public.tags for select using (true);
create policy "Public read work tags" on public.work_tags for select using (true);

-- Authenticated user policies for progress
create policy "Users manage own progress" on public.user_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own profile" on public.users
  for all
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- Optional: admin role (set via JWT claim "role" = 'app_admin')
create policy "Admins full access releases" on public.releases
  for all using (auth.jwt()->>'role' = 'app_admin') with check (auth.jwt()->>'role' = 'app_admin');
create policy "Admins full access concert halls" on public.concert_halls
  for all using (auth.jwt()->>'role' = 'app_admin') with check (auth.jwt()->>'role' = 'app_admin');
create policy "Admins full access terms" on public.terms
  for all using (auth.jwt()->>'role' = 'app_admin') with check (auth.jwt()->>'role' = 'app_admin');
create policy "Admins full access news" on public.news_posts
  for all using (auth.jwt()->>'role' = 'app_admin') with check (auth.jwt()->>'role' = 'app_admin');
create policy "Admins full access homepage blocks" on public.homepage_blocks
  for all using (auth.jwt()->>'role' = 'app_admin') with check (auth.jwt()->>'role' = 'app_admin');
