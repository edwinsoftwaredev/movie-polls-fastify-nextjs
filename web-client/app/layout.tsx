import 'styles/globals.scss';
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
        {/* @ts-expect-error Server Component */}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}; 
