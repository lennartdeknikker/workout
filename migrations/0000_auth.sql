-- better-auth schema (email + password): user, session, account, verification.
--
-- Captured from `@better-auth/cli migrate` (better-auth ^1.6). The app's own tables
-- (migrations/0001_app_tables.sql) reference "user", so this must run first.
--
-- To regenerate after changing the auth config / upgrading better-auth:
--   1) point better-auth at a scratch database
--   2) `npx @better-auth/cli migrate --config better-auth.config.ts -y`
--   3) re-dump the four tables and replace this file.

CREATE TABLE "user" (
	id text NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	"emailVerified" boolean NOT NULL,
	image text,
	"createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT user_pkey PRIMARY KEY (id),
	CONSTRAINT user_email_key UNIQUE (email)
);

CREATE TABLE session (
	id text NOT NULL,
	"expiresAt" timestamptz NOT NULL,
	token text NOT NULL,
	"createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamptz NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT session_pkey PRIMARY KEY (id),
	CONSTRAINT session_token_key UNIQUE (token),
	CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE account (
	id text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamptz,
	"refreshTokenExpiresAt" timestamptz,
	scope text,
	password text,
	"createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT account_pkey PRIMARY KEY (id),
	CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE verification (
	id text NOT NULL,
	identifier text NOT NULL,
	value text NOT NULL,
	"expiresAt" timestamptz NOT NULL,
	"createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT verification_pkey PRIMARY KEY (id)
);

CREATE INDEX "account_userId_idx" ON account USING btree ("userId");
CREATE INDEX "session_userId_idx" ON session USING btree ("userId");
CREATE INDEX verification_identifier_idx ON verification USING btree (identifier);
