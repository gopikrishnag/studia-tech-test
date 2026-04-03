---
description: Best practices and guidelines for working with Prisma
applyTo: **/prisma/**/*.prisma, **/prisma/**/*.ts
---

# Prisma Development Guidelines

## Schema Best Practices

- **Use meaningful model names:** Model names should be singular and PascalCase (e.g., `User`, `Post`, `UserProfile`).
- **Define relations clearly:** Use explicit relation fields and `@relation` attributes to define relationships between models.
- **Use enums for fixed sets of values:** For fields that can only contain a limited set of values (e.g., user roles), define an `enum`.
- **Add comments to your schema:** Document complex models, fields, or relations to explain their purpose.

## Seeding the Database

- Use the `prisma/seed.ts` file to create initial data for development and testing.
- Keep seed data realistic and concise.

## Client Usage

- Instantiate the Prisma Client once per application instance. In a Next.js app, this is typically done in a file like `src/server/db.ts`.
- Use `async/await` when querying the database with Prisma Client.
- Select only the fields you need to improve performance.
