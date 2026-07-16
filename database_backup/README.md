# Database Backup — `ainextlevel`

A restorable PostgreSQL backup for the AINextLevelTrading database.

> **Note:** This snapshot was generated as SQL (schema DDL + `INSERT` seed data)
> because no live PostgreSQL instance was running at export time, so a native
> `pg_dump` could not be taken. The output is byte-for-byte restorable with
> `psql` and matches the Prisma schema exactly. Once you have a running database,
> use `./dump.sh` to produce a true `pg_dump`.

## Contents

| File | Description |
|------|-------------|
| `01_schema.sql` | Full DDL — enums, tables, indexes, foreign keys (from the Prisma migration). |
| `02_seed_data.sql` | `INSERT` statements for the demo dataset (wrapped in a transaction). |
| `ainextlevel_backup.sql` | **Combined** schema + data — restore this one file to recreate everything. |
| `dump.sh` | Produce a real `pg_dump` from a running database. |
| `restore.sh` | Restore `ainextlevel_backup.sql` into a target database. |

## Dataset

| Table | Rows |
|-------|------|
| User | 1 (`alex@ainextleveltrading.com` / `Sup3rSecret!`, role ADMIN, Elite tier) |
| Instrument | 9 (crypto / stocks / forex) |
| Signal | 6 (AI signals with confidence + rationale/backtest JSON) |
| WhaleTransaction | 12 |
| ExchangeConnection | 4 (API keys AES-256-GCM encrypted) |
| AutomationStrategy | 3 |
| Position | 2 |
| Order | 3 |

Passwords are bcrypt-hashed (cost 12). Exchange API keys are encrypted with
AES-256-GCM using the project's `ENCRYPTION_KEY`, so the app decrypts them
correctly after restore.

## Restore

```bash
# 1. Create the database
createdb ainextlevel                       # or: psql -c 'CREATE DATABASE ainextlevel;'

# 2. Restore schema + data (one file)
psql postgresql://postgres:postgres@localhost:5432/ainextlevel \
  -f ainextlevel_backup.sql

# …or use the helper
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ainextlevel ./restore.sh
```

With Docker (from the repo root): `docker compose up -d db`, then run the restore
against `localhost:5432`.

## Producing a fresh (real) dump

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ainextlevel ./dump.sh
# → ainextlevel_YYYYMMDD_HHMMSS.sql
```

## Regenerating this snapshot

```bash
cd ../backend && node scripts/gen-dump.js
```
