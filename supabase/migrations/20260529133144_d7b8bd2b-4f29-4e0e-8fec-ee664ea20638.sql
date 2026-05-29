
-- Roles
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
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- First-signup-becomes-admin trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- TOOLS (user-added on top of the static catalog)
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  url TEXT NOT NULL,
  logo_url TEXT,
  category TEXT,
  subcategory TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  pricing TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tools" ON public.tools FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write tools" ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tools_touch BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PROMPTS
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  tool_name TEXT,
  tool_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prompts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.prompts TO authenticated;
GRANT ALL ON public.prompts TO service_role;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prompts" ON public.prompts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write prompts" ON public.prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER prompts_touch BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- LEARN TASKS
CREATE TABLE public.learn_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('spin','swipe','scratch','any')),
  title TEXT NOT NULL,
  tagline TEXT,
  category TEXT,
  difficulty TEXT,
  minutes INT DEFAULT 5,
  tool_name TEXT,
  tool_url TEXT,
  prompt TEXT,
  steps TEXT[] NOT NULL DEFAULT '{}',
  cover_url TEXT,
  reference_url TEXT,
  reference_caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learn_tasks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learn_tasks TO authenticated;
GRANT ALL ON public.learn_tasks TO service_role;
ALTER TABLE public.learn_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read learn_tasks" ON public.learn_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write learn_tasks" ON public.learn_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER learn_tasks_touch BEFORE UPDATE ON public.learn_tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- HIDDEN ITEMS (lets admin hide static catalog/tool/task entries)
CREATE TABLE public.hidden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,        -- 'tool' | 'learn_task' | 'prompt'
  ref_key TEXT NOT NULL,     -- slug or id of the static item
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, ref_key)
);
GRANT SELECT ON public.hidden_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hidden_items TO authenticated;
GRANT ALL ON public.hidden_items TO service_role;
ALTER TABLE public.hidden_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hidden" ON public.hidden_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write hidden" ON public.hidden_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
