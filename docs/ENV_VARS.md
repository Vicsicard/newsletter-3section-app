# Environment Variables in Next.js

## Loading Environment Variables

Next.js has built-in support for loading environment variables from `.env.local` into `process.env`.

```bash
# .env.local
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

### Environment Variable Load Order

Next.js loads environment variables in the following order:

1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` (Not loaded when NODE_ENV=test)
4. `.env.$(NODE_ENV)`
5. `.env`

For example, if `NODE_ENV` is `development`, the following files will be loaded in order:

1. `process.env`
2. `.env.development.local`
3. `.env.local`
4. `.env.development`
5. `.env`

### Exposing Environment Variables to the Browser

By default, environment variables are only available in the Node.js environment. To expose them to the browser, prefix them with `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_ANALYTICS_ID=abcdefgh
```

### Runtime Environment Variables

When deploying your Next.js application, you'll need to configure runtime environment variables. These are environment variables that are:

1. Not needed at build time
2. Only needed at runtime
3. Different for each environment (development, staging, production)

For Vercel deployments, you should configure these in your project settings under "Environment Variables".
