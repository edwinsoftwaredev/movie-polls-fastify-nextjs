import 'styles/globals.scss';
import AppProvider from './AppProvider';
import Footer from './footer';
import Head from './head';
import Header from './header';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      {/* @ts-expect-error Server Component */}
      <Head />
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
