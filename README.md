# DKSS Cloudflare Workers Example

This repository is just a demo for a DKSS lightning talk about Cloudflare Workers. The project uses the [RedwoodSDK](https://rwsdk.com/) starter as the base for a simple implementation of a wish book with a passkey login system.

## Running the project

To run in development mode:

```fish
pnpm dev:init # This will initialize all the necessary Wrangler & Prisma generated files for you, including the database and it's seeding
pnpm dev
```

To run in a local preview mode via Wrangler, you will have to first initialize the local database and then run:

```fish
pnpm preview
```
