-- ==============================================================================
-- Rewards Platform & Digital Wallet — Seed Mock Data
-- File: backend/docker/base/seed.sql
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. SYSTEM & OPERATIONAL ACCOUNTS
-- (These accounts represent internal reserve pools and settlement accounts)
-- ------------------------------------------------------------------------------
INSERT INTO accounts (id, user_id, type, asset_code, asset_scale, created_at)
VALUES 
  -- System Points Pool (all reward points minted to users originate from here)
  ('00000000-0000-0000-0000-000000000001', NULL, 'SYSTEM_RESERVE', 'PTS', 0, NOW() - INTERVAL '30 days'),
  -- System Fiat Clearing / Liquidity Reserve (USD)
  ('00000000-0000-0000-0000-000000000002', NULL, 'SYSTEM_RESERVE', 'USD', 2, NOW() - INTERVAL '30 days'),
  -- Partner Merchant Settlement Account
  ('00000000-0000-0000-0000-000000000003', NULL, 'MERCHANT', 'USD', 2, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. USERS
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, phone_number, password_hash, first_name, last_name, status, kyc_level, created_at, updated_at)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'alice.smith@example.com',
    '+15551234567',
    '$2b$10$wK1WwLhKzJz9L9Xo9Q9QCeXw2t0v0Q7cW6sY4z.mockhash.alice',
    'Alice',
    'Smith',
    'ACTIVE',
    2,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'bob.jones@example.com',
    '+15559876543',
    '$2b$10$wK1WwLhKzJz9L9Xo9Q9QCeXw2t0v0Q7cW6sY4z.mockhash.bob',
    'Bob',
    'Jones',
    'ACTIVE',
    1,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'charlie.brown@example.com',
    '+15550001122',
    '$2b$10$wK1WwLhKzJz9L9Xo9Q9QCeXw2t0v0Q7cW6sY4z.mockhash.charlie',
    'Charlie',
    'Brown',
    'PENDING_VERIFICATION',
    0,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 3. USER FINANCIAL & REWARD ACCOUNTS
-- ------------------------------------------------------------------------------
INSERT INTO accounts (id, user_id, type, asset_code, asset_scale, created_at)
VALUES
  -- Alice Points Balance Account (scale 0)
  ('11111111-aaaa-1111-aaaa-111111111111', 'a1111111-1111-1111-1111-111111111111', 'USER', 'PTS', 0, NOW() - INTERVAL '14 days'),
  -- Alice Cash / Fiat Balance Account (scale 2)
  ('11111111-bbbb-1111-bbbb-111111111111', 'a1111111-1111-1111-1111-111111111111', 'USER', 'USD', 2, NOW() - INTERVAL '14 days'),
  
  -- Bob Points Balance Account
  ('22222222-aaaa-2222-aaaa-222222222222', 'b2222222-2222-2222-2222-222222222222', 'USER', 'PTS', 0, NOW() - INTERVAL '7 days'),
  -- Bob Cash / Fiat Balance Account
  ('22222222-bbbb-2222-bbbb-222222222222', 'b2222222-2222-2222-2222-222222222222', 'USER', 'USD', 2, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 4. LINKED WALLETS (Open Payments Endpoints)
-- ------------------------------------------------------------------------------
INSERT INTO wallets (id, user_id, wallet_address_url, asset_code, asset_scale, auth_server, resource_server, status, is_default, created_at, updated_at)
VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'https://ilp.interledger-test.dev/ijubane',
    'USD',
    2,
    'https://rafiki-auth.interledger-test.dev',
    'https://ilp.interledger-test.dev',
    'ACTIVE',
    true,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'https://ilp.interledger-test.dev/leli',
    'USD',
    2,
    'https://rafiki-auth.interledger-test.dev',
    'https://ilp.interledger-test.dev',
    'ACTIVE',
    true,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 5. WALLET GRANTS (Finalized Open Payments GNAP Access Tokens)
-- ------------------------------------------------------------------------------
INSERT INTO wallet_grants (id, wallet_id, access_token_enc, manage_url, interact_ref, scope, expires_at, created_at, updated_at)
VALUES
  (
    'f1111111-1111-1111-1111-111111111111',
    'd1111111-1111-1111-1111-111111111111',
    'U2FsdGVkX19mock_encrypted_access_token_alice_grant_001',
    'https://rafiki-auth.interledger-test.dev/token/manage/alice-token-uuid-1',
    'interact_ref_alice_consent_approved_001',
    '["incoming-payment", "quote", "outgoing-payment"]'::jsonb,
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    'd2222222-2222-2222-2222-222222222222',
    'U2FsdGVkX19mock_encrypted_access_token_bob_grant_002',
    'https://rafiki-auth.interledger-test.dev/token/manage/bob-token-uuid-2',
    'interact_ref_bob_consent_approved_002',
    '["incoming-payment", "quote", "outgoing-payment"]'::jsonb,
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 6. DOUBLE-ENTRY LEDGER TRANSFERS
-- (All movements are balanced debits and credits with integer amounts)
-- ------------------------------------------------------------------------------
INSERT INTO ledger_transfers (id, idempotency_key, debit_account_id, credit_account_id, amount, status, category, description, created_at)
VALUES
  -- 1. System grants Alice 500 Reward Points (Welcome Bonus)
  (
    'c1111111-1111-1111-1111-111111111111',
    'idemp-reward-welcome-alice-001',
    '00000000-0000-0000-0000-000000000001', -- Debit System Points Reserve
    '11111111-aaaa-1111-aaaa-111111111111', -- Credit Alice Points Account
    500,                                   -- 500 Points (scale 0)
    'POSTED',
    'REWARD_MINT',
    'Welcome bonus signup reward',
    NOW() - INTERVAL '14 days'
  ),

  -- 2. System grants Bob 250 Reward Points (Welcome Bonus)
  (
    'c2222222-2222-2222-2222-222222222222',
    'idemp-reward-welcome-bob-002',
    '00000000-0000-0000-0000-000000000001', -- Debit System Points Reserve
    '22222222-aaaa-2222-aaaa-222222222222', -- Credit Bob Points Account
    250,
    'POSTED',
    'REWARD_MINT',
    'Welcome bonus signup reward',
    NOW() - INTERVAL '7 days'
  ),

  -- 3. Alice deposits $100.00 USD into her wallet
  (
    'c3333333-3333-3333-3333-333333333333',
    'idemp-deposit-alice-usd-003',
    '00000000-0000-0000-0000-000000000002', -- Debit System Liquidity Reserve
    '11111111-bbbb-1111-bbbb-111111111111', -- Credit Alice USD Account
    10000,                                 -- $100.00 USD (scale 2 = 10,000 cents)
    'POSTED',
    'DEPOSIT',
    'Initial wallet deposit via Open Payments',
    NOW() - INTERVAL '5 days'
  ),

  -- 4. Alice pays $15.50 USD to Merchant Store
  (
    'c4444444-4444-4444-4444-444444444444',
    'idemp-purchase-alice-merchant-004',
    '11111111-bbbb-1111-bbbb-111111111111', -- Debit Alice USD Account
    '00000000-0000-0000-0000-000000000003', -- Credit Merchant USD Account
    1550,                                  -- $15.50 USD (1,550 cents)
    'POSTED',
    'CARD_PAYOUT',
    'Purchase at Cloud Nine Coffee',
    NOW() - INTERVAL '2 days'
  ),

  -- 5. Alice earns 30 Reward Points for her purchase (Cashback)
  (
    'c5555555-5555-5555-5555-555555555555',
    'idemp-cashback-alice-purchase-005',
    '00000000-0000-0000-0000-000000000001', -- Debit System Points Reserve
    '11111111-aaaa-1111-aaaa-111111111111', -- Credit Alice Points Account
    30,                                    -- 30 Points
    'POSTED',
    'REWARD_MINT',
    '2% cashback on Coffee purchase',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 7. REWARD EVENTS (Auditable activity log linked to transfers)
-- ------------------------------------------------------------------------------
INSERT INTO reward_events (id, user_id, campaign_id, transfer_id, points, event_type, metadata, created_at)
VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    NULL,
    'c1111111-1111-1111-1111-111111111111',
    500,
    'EARNED',
    '{"reason": "signup_welcome", "source": "onboarding_flow"}'::jsonb,
    NOW() - INTERVAL '14 days'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    NULL,
    'c2222222-2222-2222-2222-222222222222',
    250,
    'EARNED',
    '{"reason": "signup_welcome", "source": "onboarding_flow"}'::jsonb,
    NOW() - INTERVAL '7 days'
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    NULL,
    'c5555555-5555-5555-5555-555555555555',
    30,
    'EARNED',
    '{"reason": "merchant_cashback", "merchant": "Cloud Nine Coffee", "order_amount_usd": 15.50}'::jsonb,
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
