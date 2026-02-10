-- Обновить constraint для subscription_tier, чтобы разрешить free, pro, enterprise
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS chk_subscription_tier;
ALTER TABLE organizations ADD CONSTRAINT chk_subscription_tier CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));