# Manager Shop

Shop management dashboard built with [Next.js](https://nextjs.org).

## Connect MongoDB

1. Start a local MongoDB server, or create a MongoDB Atlas cluster and database user.
2. Copy `.env.example` to `.env.local` in this folder.
3. Set `MONGODB_URI` in `.env.local` to your MongoDB connection string. Keep this file private; it is ignored by Git.
4. Optionally change `MONGODB_DB` from `manager_shop` to your database name.

The manager reads and creates documents in the `products` collection. Each product has a name, SKU, category, price, stock quantity, color, and creation date. SKUs are unique.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3100](http://localhost:3100).

Run `npm run lint` and `npm run build` to validate changes.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
