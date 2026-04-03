---
description: Best practices and guidelines for working with Neon (serverless PostgreSQL)
applyTo: **/prisma/schema.prisma, **/*.ts, **/*.js
---

# Neon (Serverless PostgreSQL) Development Guidelines

## General Best Practices

- **Use the correct connection string:** Neon provides different connection strings for pooled and direct connections. Use the pooled connection string for serverless environments to manage connections efficiently.
- **Secure your database credentials:** Store your database connection string in environment variables. Do not hard-code credentials in your application code. Use a `.env` file for local development and your hosting provider's secret management for production.

## Connection Pooling

- **Use a pooled connection string:** In a serverless environment, it's crucial to use a connection pooler to manage database connections. Neon provides a pooled connection string that uses PgBouncer.
- **Configure Prisma for connection pooling:** When using Prisma, ensure your `datasource` in `schema.prisma` is configured to use the pooled connection string from your environment variables. You also need to append `?pgbouncer=true` to the `shadowDatabaseUrl` to avoid issues with Prisma Migrate.

Example `schema.prisma` configuration:
```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Use a direct connection for migrations
}
```

And in your `.env` file:
```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true"
SHADOW_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

## Branching

- **Use branching for development and testing:** Neon's branching feature allows you to create isolated database branches for development, testing, and CI/CD. This is a powerful feature for preventing conflicts and ensuring a clean workflow.
- **Create a new branch for each feature:** Create a new branch for each new feature or bug fix. This allows you to work in isolation without affecting the main database.
- **Use branches in your CI/CD pipeline:** Integrate Neon's branching into your CI/CD pipeline to create a new database branch for each pull request. This allows you to run tests against a dedicated database instance.

## Prisma Integration

- **Use Prisma with Neon:** Prisma is a great ORM to use with Neon. It provides a type-safe database client and simplifies database access.
- **Run migrations on a direct connection:** When running Prisma migrations, it's recommended to use a direct (non-pooled) connection string for the `shadowDatabaseUrl`. This is because migrations may require elevated privileges that are not available through the connection pooler.
