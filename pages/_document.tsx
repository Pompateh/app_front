import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to Google Fonts or other resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Custom fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
            rel="stylesheet"
          />
          {/* SEO Meta Tags */}
          <meta name="description" content="Newstalgia - Creative studios and dynamic design projects." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Open Graph tags for social sharing */}
          <meta property="og:title" content="Newstalgia" />
          <meta property="og:description" content="Explore creative studios and innovative design projects." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://yourproductiondomain.com" />
          <meta property="og:image" content="/og-image.jpg" />
        </Head>
        <body className="bg-gray-50">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;