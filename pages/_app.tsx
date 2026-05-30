import 'lenis/dist/lenis.css';
import '../styles/experience.css';
import '../styles/dish-hero.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
