CREATE TABLE public.sales_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_message_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ai_message_id)
);

GRANT SELECT, INSERT, DELETE ON public.sales_chat_messages TO authenticated;
GRANT ALL ON public.sales_chat_messages TO service_role;

ALTER TABLE public.sales_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sales chat" ON public.sales_chat_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own sales chat" ON public.sales_chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can clear their own sales chat" ON public.sales_chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX sales_chat_messages_user_created_idx
  ON public.sales_chat_messages (user_id, created_at);