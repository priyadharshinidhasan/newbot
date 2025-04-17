import 'news-tracker-app\src\app\globals.css'; // Ensure this line is present
import type { AppProps } from 'next/app';
// pages/_app.tsx
import "news-tracker-app\src\app\globals.css";


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
