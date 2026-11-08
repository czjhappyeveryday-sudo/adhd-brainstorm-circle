CREATE TABLE public.struggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  author TEXT NOT NULL DEFAULT '' CHECK (char_length(author) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.struggles TO anon, authenticated;
GRANT ALL ON public.struggles TO service_role;
ALTER TABLE public.struggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read struggles" ON public.struggles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add struggles" ON public.struggles FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  struggle_id UUID NOT NULL REFERENCES public.struggles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  content TEXT NOT NULL DEFAULT '' CHECK (char_length(content) <= 3000),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  author TEXT NOT NULL DEFAULT '' CHECK (char_length(author) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX solutions_struggle_id_idx ON public.solutions(struggle_id);
GRANT SELECT, INSERT ON public.solutions TO anon, authenticated;
GRANT ALL ON public.solutions TO service_role;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read solutions" ON public.solutions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add solutions" ON public.solutions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  author TEXT NOT NULL DEFAULT '' CHECK (char_length(author) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.encouragements TO anon, authenticated;
GRANT ALL ON public.encouragements TO service_role;
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read encouragements" ON public.encouragements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add encouragements" ON public.encouragements FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  authors TEXT NOT NULL DEFAULT '' CHECK (char_length(authors) <= 300),
  year SMALLINT CHECK (year IS NULL OR year BETWEEN 1800 AND 2100),
  url TEXT NOT NULL DEFAULT '' CHECK (char_length(url) <= 500),
  summary TEXT NOT NULL DEFAULT '' CHECK (char_length(summary) <= 3000),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  added_by TEXT NOT NULL DEFAULT '' CHECK (char_length(added_by) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.papers TO anon, authenticated;
GRANT ALL ON public.papers TO service_role;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read papers" ON public.papers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add papers" ON public.papers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.paper_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 3000),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  author TEXT NOT NULL DEFAULT '' CHECK (char_length(author) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX paper_reflections_paper_id_idx ON public.paper_reflections(paper_id);
GRANT SELECT, INSERT ON public.paper_reflections TO anon, authenticated;
GRANT ALL ON public.paper_reflections TO service_role;
ALTER TABLE public.paper_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reflections" ON public.paper_reflections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add reflections" ON public.paper_reflections FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.struggles (id, title, description, priority, author) VALUES
  ('11111111-1111-1111-1111-111111111111', '一坐下就分心，任务开不了头', '明明知道要做，打开电脑却刷了一小时手机。', 5, '小晴'),
  ('22222222-2222-2222-2222-222222222222', '总是忘记约定和截止日期', '日历记了也不看，等想起来已经迟了。', 4, '阿木'),
  ('33333333-3333-3333-3333-333333333333', '情绪起伏大，容易自责', '一件小事没做好就觉得自己什么都不行。', 3, '');

INSERT INTO public.solutions (struggle_id, title, content, priority, author) VALUES
  ('11111111-1111-1111-1111-111111111111', '只做两分钟', '告诉自己只做两分钟，开了头往往就能继续下去。', 5, '小晴'),
  ('11111111-1111-1111-1111-111111111111', '手机放到另一个房间', '物理隔离比意志力管用得多。', 4, ''),
  ('22222222-2222-2222-2222-222222222222', '设置多重提醒', '提前一天、一小时、十分钟各提醒一次。', 4, '阿木');

INSERT INTO public.encouragements (content, priority, author) VALUES
  ('你的大脑不是坏掉了，只是用不同的方式运转。', 5, '小晴'),
  ('今天哪怕只完成了一件小事，也值得为自己鼓掌。', 4, '阿木'),
  ('慢一点没关系，我们一起往前走。', 3, '');

INSERT INTO public.papers (id, title, authors, year, url, summary, priority, added_by) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Attention-deficit/hyperactivity disorder', 'Faraone, S. V. et al.', 2015, 'https://doi.org/10.1038/nrdp.2015.20', 'Nature Reviews Disease Primers 对 ADHD 的综述，涵盖流行病学、机制、诊断与治疗。', 5, '小晴');

INSERT INTO public.paper_reflections (paper_id, content, priority, author) VALUES
  ('44444444-4444-4444-4444-444444444444', '读完才知道 ADHD 在成年人中也很常见，不是“长大就好了”。这让我更能接纳自己。', 4, '小晴');