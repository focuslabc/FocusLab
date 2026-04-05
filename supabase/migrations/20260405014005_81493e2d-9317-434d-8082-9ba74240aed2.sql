
-- Add plan column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

-- Create subscriptions table for payment history
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kiwify_order_id text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  offer_id text,
  amount numeric(10,2),
  customer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kiwify_order_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
