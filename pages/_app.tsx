import '../styles/globals.css'
import type { AppProps } from 'next/app'
import ErrorBoundary from '../components/ErrorBoundary'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as gtag from '../lib/gtag'
import '../styles/globals.css';
// Removed: import '@fontsource/bebas-neue';
// Removed: import '@fontsource/literata';
import '@fontsource/crimson-pro'; // Example for Crimson Pro

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    }
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    }
  }, [router.events]);

  return (
    <>
      <Head>
        <title>Newstalgia</title>
        <meta name="theme-color" content="#ffffff" />
        {/* Load GA script asynchronously */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}></script>
        <script
          // This inline script initializes GA
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  )
}

export default MyApp
