
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, tagline TEXT, description TEXT,
  url TEXT NOT NULL, logo_url TEXT, category TEXT, subcategory TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}', pricing TEXT,
  featured BOOLEAN NOT NULL DEFAULT false, sort_order INT NOT NULL DEFAULT 0,
  seo_title TEXT, seo_description TEXT, seo_slug TEXT,
  og_title TEXT, og_description TEXT, twitter_title TEXT, twitter_description TEXT,
  long_form JSONB, structured_data JSONB, seo_generated_at TIMESTAMPTZ,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tools" ON public.tools FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write tools" ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tools_touch BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, body TEXT NOT NULL, category TEXT,
  tool_name TEXT, tool_url TEXT, image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}', sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prompts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.prompts TO authenticated;
GRANT ALL ON public.prompts TO service_role;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prompts" ON public.prompts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write prompts" ON public.prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER prompts_touch BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.learn_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, kind TEXT NOT NULL CHECK (kind IN ('spin','swipe','scratch','any')),
  title TEXT NOT NULL, tagline TEXT, category TEXT, difficulty TEXT, minutes INT DEFAULT 5,
  tool_name TEXT, tool_url TEXT, prompt TEXT, steps TEXT[] NOT NULL DEFAULT '{}',
  cover_url TEXT, reference_url TEXT, reference_caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learn_tasks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learn_tasks TO authenticated;
GRANT ALL ON public.learn_tasks TO service_role;
ALTER TABLE public.learn_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read learn_tasks" ON public.learn_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write learn_tasks" ON public.learn_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER learn_tasks_touch BEFORE UPDATE ON public.learn_tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.hidden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL, ref_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (kind, ref_key)
);
GRANT SELECT ON public.hidden_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hidden_items TO authenticated;
GRANT ALL ON public.hidden_items TO service_role;
ALTER TABLE public.hidden_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hidden" ON public.hidden_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write hidden" ON public.hidden_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, anon, service_role;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, name text NOT NULL, description text,
  sort_order integer NOT NULL DEFAULT 0,
  seo_title TEXT, seo_description TEXT, seo_slug TEXT,
  og_title TEXT, og_description TEXT, twitter_title TEXT, twitter_description TEXT,
  long_form JSONB, structured_data JSONB, seo_generated_at TIMESTAMPTZ,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL, slug text NOT NULL, name text NOT NULL, description text,
  sort_order integer NOT NULL DEFAULT 0,
  seo_title TEXT, seo_description TEXT, seo_slug TEXT,
  og_title TEXT, og_description TEXT, twitter_title TEXT, twitter_description TEXT,
  long_form JSONB, structured_data JSONB, seo_generated_at TIMESTAMPTZ,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_slug, slug)
);
GRANT SELECT ON public.subcategories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subcategories TO authenticated;
GRANT ALL ON public.subcategories TO service_role;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write subcategories" ON public.subcategories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_subcategories_updated BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, title text NOT NULL, excerpt text,
  body text NOT NULL DEFAULT '', content_html text, cover_url text,
  tags text[] NOT NULL DEFAULT '{}', published boolean NOT NULL DEFAULT false,
  published_at timestamptz, sort_order integer NOT NULL DEFAULT 0,
  seo_title text, seo_description text, focus_keyword text, canonical_url text,
  og_title text, og_description text, og_image text,
  twitter_title text, twitter_description text, twitter_image text,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blog" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admin manage blog" ON public.blog_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, title text NOT NULL, author text, description text,
  cover_url text, affiliate_url text NOT NULL, price_label text,
  tags text[] NOT NULL DEFAULT '{}', featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read books" ON public.books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write books" ON public.books FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_books_updated BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, title text NOT NULL, provider text, description text,
  cover_url text, affiliate_url text NOT NULL, price_label text,
  level text, duration text, tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write courses" ON public.courses FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Public read content-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'content-images');
CREATE POLICY "Admin upload content-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admin update content-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete content-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'content-images' AND has_role(auth.uid(),'admin'));

CREATE TABLE public.bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text NOT NULL, page_url text,
  severity text NOT NULL DEFAULT 'medium', reporter_email text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bug_reports TO authenticated;
GRANT INSERT ON public.bug_reports TO anon;
GRANT ALL ON public.bug_reports TO service_role;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a bug report" ON public.bug_reports FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND severity IN ('low','medium','high','critical')
    AND char_length(title) BETWEEN 1 AND 200
    AND char_length(description) BETWEEN 1 AND 4000
    AND (reporter_email IS NULL OR char_length(reporter_email) <= 320)
    AND (page_url IS NULL OR char_length(page_url) <= 2000));
CREATE POLICY "Admins can view all bug reports" ON public.bug_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update bug reports" ON public.bug_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete bug reports" ON public.bug_reports FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bug_reports_touch BEFORE UPDATE ON public.bug_reports FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_subcategories_category_slug ON public.subcategories(category_slug);
CREATE INDEX idx_tools_category ON public.tools(category);
CREATE INDEX idx_tools_subcategory ON public.tools(subcategory);
CREATE INDEX idx_tools_sort_order ON public.tools(sort_order);
CREATE INDEX idx_blog_posts_published_created ON public.blog_posts(published, created_at DESC);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_learn_tasks_sort ON public.learn_tasks(sort_order);

CREATE TABLE public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ, accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_invitations_email ON public.admin_invitations(lower(email));
CREATE INDEX idx_admin_invitations_token ON public.admin_invitations(token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read invitations" ON public.admin_invitations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage invitations" ON public.admin_invitations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT, action TEXT NOT NULL,
  target_email TEXT, target_user_id UUID, metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_audit_created ON public.admin_audit_log(created_at DESC);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.invite_admin(_email TEXT)
RETURNS public.admin_invitations LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _inv public.admin_invitations;
BEGIN
  IF _actor IS NULL OR NOT public.has_role(_actor, 'admin') THEN RAISE EXCEPTION 'forbidden: admin only'; END IF;
  IF _email IS NULL OR _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid email'; END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  INSERT INTO public.admin_invitations (email, invited_by) VALUES (lower(_email), _actor) RETURNING * INTO _inv;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, metadata)
    VALUES (_actor, _actor_email, 'invite_admin', lower(_email), jsonb_build_object('invitation_id', _inv.id));
  RETURN _inv;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor UUID := auth.uid(); _actor_email TEXT; _target_email TEXT; _admin_count INT;
BEGIN
  IF _actor IS NULL OR NOT public.has_role(_actor,'admin') THEN RAISE EXCEPTION 'forbidden: admin only'; END IF;
  SELECT COUNT(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin';
  IF _admin_count <= 1 THEN RAISE EXCEPTION 'cannot revoke the last admin'; END IF;
  SELECT email INTO _actor_email FROM auth.users WHERE id = _actor;
  SELECT email INTO _target_email FROM auth.users WHERE id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id)
    VALUES (_actor, _actor_email, 'revoke_admin', _target_email, _user_id);
END; $$;

CREATE OR REPLACE FUNCTION public.accept_admin_invitation(_token UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _user UUID := auth.uid(); _user_email TEXT; _inv public.admin_invitations;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'must be signed in'; END IF;
  SELECT email INTO _user_email FROM auth.users WHERE id = _user;
  SELECT * INTO _inv FROM public.admin_invitations WHERE token = _token AND status = 'pending' AND expires_at > now() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invitation invalid or expired'; END IF;
  IF lower(_inv.email) <> lower(_user_email) THEN RAISE EXCEPTION 'invitation email does not match signed-in account'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE public.admin_invitations SET status='accepted', accepted_at=now(), accepted_by=_user WHERE id = _inv.id;
  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, target_email, target_user_id, metadata)
    VALUES (_user, _user_email, 'accept_invitation', _user_email, _user, jsonb_build_object('invitation_id', _inv.id, 'invited_by', _inv.invited_by));
END; $$;

CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id UUID, email TEXT, granted_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT ur.user_id, u.email::TEXT, ur.created_at
    FROM public.user_roles ur JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin' ORDER BY ur.created_at;
END; $$;

GRANT EXECUTE ON FUNCTION public.invite_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_admin_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

CREATE TABLE public.seo_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('category','subcategory','tool')),
  slug_path TEXT NOT NULL,
  seo_title TEXT, seo_description TEXT, og_title TEXT, og_description TEXT,
  twitter_title TEXT, twitter_description TEXT, long_form JSONB, structured_data JSONB,
  model TEXT, generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (kind, slug_path)
);
GRANT SELECT ON public.seo_content TO anon, authenticated;
GRANT ALL ON public.seo_content TO service_role;
ALTER TABLE public.seo_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seo_content" ON public.seo_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write seo_content" ON public.seo_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX seo_content_kind_slug_idx ON public.seo_content (kind, slug_path);
CREATE TRIGGER seo_content_touch BEFORE UPDATE ON public.seo_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.seo_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table TEXT NOT NULL CHECK (target_table IN ('categories','subcategories','tools')),
  target_id UUID NOT NULL, status TEXT NOT NULL CHECK (status IN ('success','error')),
  model TEXT, error TEXT, prompt_tokens INT, completion_tokens INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_generation_log TO authenticated;
GRANT ALL ON public.seo_generation_log TO service_role;
ALTER TABLE public.seo_generation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read seo log" ON public.seo_generation_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write seo log" ON public.seo_generation_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX seo_generation_log_target_idx ON public.seo_generation_log (target_table, target_id, created_at DESC);

CREATE TABLE public.tool_comparison_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL UNIQUE REFERENCES public.tools(id) ON DELETE CASCADE,
  company TEXT, website TEXT, launch_year INT, status TEXT,
  open_source BOOLEAN NOT NULL DEFAULT false,
  api_available BOOLEAN NOT NULL DEFAULT false,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  models JSONB NOT NULL DEFAULT '{}'::jsonb,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  platforms JSONB NOT NULL DEFAULT '{}'::jsonb,
  languages JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  limitations JSONB NOT NULL DEFAULT '{}'::jsonb,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tool_comparison_tool_id ON public.tool_comparison_data(tool_id);
GRANT SELECT ON public.tool_comparison_data TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tool_comparison_data TO authenticated;
GRANT ALL ON public.tool_comparison_data TO service_role;
ALTER TABLE public.tool_comparison_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comparison" ON public.tool_comparison_data FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write comparison" ON public.tool_comparison_data FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tool_comparison_data_touch BEFORE UPDATE ON public.tool_comparison_data
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
