CREATE INDEX IF NOT EXISTS idx_subcategories_category_slug ON public.subcategories(category_slug);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_subcategory ON public.tools(subcategory);
CREATE INDEX IF NOT EXISTS idx_tools_sort_order ON public.tools(sort_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON public.blog_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_tasks_sort ON public.learn_tasks(sort_order);