# Credential Distributor

A Next.js app for one-time manual distribution of credentials.

## What it does

- Users submit their email on a public page.
- An admin receives an email notification.
- The admin logs into `/admin`, imports account credentials from CSV, and manually selects an available account for a request.
- Once an account is sent, it is permanently marked as `SENT` and cannot be reused.

## CSV format

Use these columns:

```csv
username,password,label
user1@example.com,s3cret,Pool A
user2@example.com,abc123,Pool B
```

## Security model

The app enforces one-time usage in the database.

- `Account.status` starts as `AVAILABLE`
- During sending, a database transaction updates the account to `SENT`
- The request is linked to the account with a unique field
- If two admins click at once, only one update succeeds

## Tech stack

- Next.js App Router
- Prisma
- PostgreSQL
- Nodemailer

## Setup

1. Copy `.env.example` to `.env`
2. Fill in all SMTP and database values
3. Install packages
4. Run Prisma
5. Start the app

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run dev
```

## Important notes

- `ENCRYPTION_KEY` must be exactly 32 characters long.
- Raw credentials are encrypted at rest before they are stored in the database.
- This is an MVP starter and has not been production-hardened.

## Recommended production improvements

- Replace simple cookie auth with a real auth provider
- Add CSRF protection and rate limiting
- Add request deduplication per email if needed
- Add audit log views in the UI
- Add background-safe retry handling for email delivery
- Prefer one-time login links instead of sending passwords by email
