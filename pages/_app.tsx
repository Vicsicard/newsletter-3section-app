import type { AppProps } from 'next/app';
import ErrorBoundary from '@/components/ErrorBoundary';
import { inter } from '@/utils/fonts';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </ErrorBoundary>
  );
}

export default MyApp;
