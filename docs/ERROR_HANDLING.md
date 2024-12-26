# Error Handling in Next.js

## Types of Errors

1. **Build-time Errors**
   - TypeScript errors
   - Missing dependencies
   - Environment variable issues
   - Static generation failures

2. **Runtime Errors**
   - API failures
   - Database connection issues
   - Client-side errors

## Handling Build-time Errors

### In getStaticProps

```typescript
export async function getStaticProps() {
  try {
    // Your data fetching logic
    return {
      props: { data }
    }
  } catch (error) {
    // Don't throw errors during build
    return {
      notFound: true // Returns 404 page
      // or
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
}
```

### In getStaticPaths

```typescript
export async function getStaticPaths() {
  try {
    // Your path generation logic
    return {
      paths: [],
      fallback: true // or 'blocking'
    }
  } catch (error) {
    // Always return valid paths object
    return {
      paths: [],
      fallback: true
    }
  }
}
```

## Error Boundaries

Use error boundaries to catch runtime errors:

```typescript
'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Best Practices

1. **Never throw errors during build**
   - Always return `notFound` or `redirect`
   - Log errors for debugging

2. **Handle missing data gracefully**
   - Provide fallback UI
   - Redirect to error page

3. **Type safety**
   - Use TypeScript
   - Validate data shapes
   - Handle null/undefined cases

4. **Environment Variables**
   - Validate at startup
   - Provide clear error messages
   - Use TypeScript for type safety
