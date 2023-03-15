import 'styles/globals.scss';
import AppProvider from './AppProvider';
import Footer from './footer';
import Header from './header';

export const metadata = {
  title: {
    default: 'Movie Polls',
    template: '%s | Movie Polls',
  },
  applicationName: 'Movie Polls',
  openGraph: {
    title: 'Movie Polls',
    description: 'Movie polls made easy',
    url: 'https://movie-polls.edwinsoftware.dev/',
    siteName: 'Movie Polls',
    type: 'website',
  },
  icons: {
    icon: undefined,
    shortcut: undefined,
    apple: undefined,
    other: undefined,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    notranslate: true,
    noimageindex: true,
    nosnippet: true,
    nositelinkssearchbox: true,
    googleBot: {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      nositelinkssearchbox: true,
      notranslate: true,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {/* @ts-expect-error Server Component */}
          <Header />
          <main id="app-main">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
