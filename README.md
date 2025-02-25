This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and deployed on Vercel.

### About

The project is a demo and as such a number of functionalities don't work. For instance, `approve loan` from the `loan table` doesnt work. Also authentication is by `email` and `password` only.

The idea here is to give an idea of how one might approach publishing loans - to a group of prevetted investors by a group of prevetted entreprenuers - leveraging `nextjs`, `tailwind`, `shadcn` and `postgres` with `prisma`.

All work was done on the main branch (anti-pattern) for speed and efficiency and the project leans heavily on Vercel's VO

Possible Improvements

- introduction of apm software like Sentry for better error handling
- better and more granular components that follow domain driven design (i.e a component like borrower informatin is generic and can be in root/components but a component like signup form must be in root/signup/components)
- Granular testing
- Introduction of Edge support for prisma and Next auth

## Getting Started

First install required dependencies.

```bash
  npm i --legacy-peer-deps
```

Second, replace the required env variables with relevant variables and the run the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Pages

- Home `/`
- Auth `/login`, `/signup`
- Create Loan {Authenticated} `/loans/create`
- View Loan `/loans/:id`
- View My Loans {Authenticated} `/loans/user`
- View All Prefunded Loans `/loans`

### Notable Dependencies

- nextauth
- prisma
- lucide-react
