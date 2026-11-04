-- Add subscription plan tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_plan text DEFAULT 'free',
ADD COLUMN subscription_status text DEFAULT 'inactive',
ADD COLUMN subscription_expires_at timestamp with time zone DEFAULT NULL;

-- Create an index for better performance when querying by plan
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);