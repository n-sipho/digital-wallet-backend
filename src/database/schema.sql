CREATE TYPE account_type AS ENUM ('USER', 'SYSTEM_RESERVE', 'MERCHANT');
CREATE TYPE transaction_status AS ENUM ('POSTED', 'PENDING', 'VOIDED');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
CREATE TYPE wallet_status AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
CREATE TYPE reward_events_type AS ENUM ('EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTMENT');

CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(32) UNIQUE,
        password_hash VARCHAR(255), -- Nullable if using OAuth/Magic Link
        status user_status NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

CREATE INDEX idx_users_email ON users(email);

-- Linked Wallet Addresses
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address_url TEXT NOT NULL, -- e.g. "https://ilp.interledger-test.dev/ijubane"
    asset_code VARCHAR(12) NOT NULL,  -- e.g. "ZAR"
    asset_scale SMALLINT NOT NULL DEFAULT 2,
    auth_server TEXT NOT NULL,        -- e.g. "https://rafiki-auth.interledger-test.dev"
    resource_server TEXT NOT NULL,    -- e.g. "https://ilp.interledger-test.dev"
    status wallet_status NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_wallet UNIQUE(user_id, wallet_address_url)
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- Open Payments GNAP Access Tokens
CREATE TABLE wallet_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    access_token_enc TEXT NOT NULL, -- Encrypted at rest using AES-256-GCM
    manage_url TEXT,                -- GNAP token rotation endpoint
    interact_ref TEXT,              -- Reference from the completed consent interaction
    scope JSONB NOT NULL,           -- ['incoming-payment', 'quote', 'outgoing-payment']
    expires_at TIMESTAMPTZ,         -- Nullable if permanent until revoked
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_grants_wallet ON wallet_grants(wallet_id);

-- Accounts (Users, Merchants, and System Liquidity Reserves)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type account_type NOT NULL, -- 'USER', 'SYSTEM_RESERVE', 'MERCHANT'
    -- Types:
    --   'USER_POINTS'           (User's points balance)
    --   'USER_CASH'             (User's fiat deposit if custodial)
    --   'SYSTEM_POINTS_RESERVE' (Points pool from which rewards are minted)
    --   'SYSTEM_CASH_SETTLEMENT'(Operating bank liquidity)
    --   'MERCHANT_PAYOUT'       (Settlement for partners)
    asset_code VARCHAR(12) NOT NULL, -- 'PTS', 'ZAR'
    asset_scale SMALLINT NOT NULL DEFAULT 0, -- 0 for points (integer), 2 for fiat cents
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_type ON accounts(user_id, type);

-- Immutable Ledger Transfers
CREATE TABLE ledger_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL, -- Prevents double-spending on mobile retries
    debit_account_id UUID NOT NULL REFERENCES accounts(id),
    credit_account_id UUID NOT NULL REFERENCES accounts(id),
    amount BIGINT NOT NULL CHECK (amount > 0),    -- Integer units (cents or points, NEVER floats)
    status transaction_status NOT NULL DEFAULT 'POSTED', -- 'PENDING', 'POSTED', 'VOIDED'
    category VARCHAR(32) NOT NULL,
    -- Categories:
    --   'REWARD_MINT'     (System -> User points)
    --   'REWARD_BURN'     (User -> System points redemption)
    --   'PEER_PAYMENT'    (User -> User via Open Payments)
    --   'CARD_PAYOUT'     (Settlement)

    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transfers_debit ON ledger_transfers(debit_account_id);
CREATE INDEX idx_transfers_credit ON ledger_transfers(credit_account_id);
CREATE INDEX idx_transfers_created ON ledger_transfers(created_at DESC);


-- Reward Audit Log (Tied directly to ledger transfers)
CREATE TABLE reward_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transfer_id UUID NOT NULL REFERENCES ledger_transfers(id), -- Every reward creates a ledger entry
    points BIGINT NOT NULL,
    event_type reward_events_type NOT NULL, -- 'EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTMENT'
    metadata JSONB,                  -- e.g. {"order_id": "123", "merchant": "Store A"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_events_user ON reward_events(user_id, created_at DESC);
