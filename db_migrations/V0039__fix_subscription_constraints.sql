-- Удалить старый constraint chk_subscription_tier
ALTER TABLE organizations DROP CONSTRAINT chk_subscription_tier;

-- Удалить constraint organizations_subscription_tier_check
ALTER TABLE organizations DROP CONSTRAINT organizations_subscription_tier_check;

-- Создать новый constraint для subscription_tier
ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Удалить старый constraint для subscription_status
ALTER TABLE organizations DROP CONSTRAINT organizations_subscription_status_check;

-- Создать новый constraint для subscription_status
ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_status_check 
  CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled'));