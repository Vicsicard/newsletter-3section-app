import express, { Request, Response } from 'express';
import next from 'next';
import path from 'path';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

console.log('Starting server with configuration:', {
  port,
  dev,
  nodeEnv: process.env.NODE_ENV,
  cwd: process.cwd()
});

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Make sure errors are properly caught and logged
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process in development
  if (!dev) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  // Don't exit the process in development
  if (!dev) {
    process.exit(1);
  }
});

async function start() {
  try {
    await nextApp.prepare();
    const app = express();

    // Handle Next.js requests
    app.all('*', (req: Request, res: Response) => {
      return nextHandler(req, res);
    });

    app.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

start();
