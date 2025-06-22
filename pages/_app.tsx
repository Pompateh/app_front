import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import ErrorBoundary from '../components/ErrorBoundary'
// import * as gtag from '../lib/gtag'
// Removed: import '@fontsource/literata';
import '@fontsource/crimson-pro'; // Example for Crimson Pro

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      // gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>Newstalgia</title>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
      </Head>
      {/* <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
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
        /> */}
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  )
}

export default MyApp
