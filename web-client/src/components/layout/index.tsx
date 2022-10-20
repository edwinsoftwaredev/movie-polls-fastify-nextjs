import { PropsWithChildren } from "react";
import Head from "next/head";
import Footer from "../footer/Footer";
import Header from "../header";
import { trpc } from "src/trpc";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  // --- Server Auth flow ---
  // 1. Check that user is authenticated (that there is session or sessionId cookie)
  // 2. If user is not authenticated then show login components
  // 3. If user is authenticated dont show login components

  // --- Client Auth flow ---
  // 1. Get session if there isn't (make the request on client side to the api)
  // 2. If there is an authenticated user dont show login UI
  // 3. If there isn't an authenticated user show login UI

  /**
   * --- NOTE ---
   * The Next.js's logic that includes getServerSideProps or getStaticProps
   * and client side is handle by tRPC and React-Query
   */
  const { data: session } = trpc.useQuery(['session:getSession'], {
    // TODO: Update configuration.
    // Setting s ssr to false due to this component not being a page and 
    // not being in page
    ssr: false,
  });

  const { csrfToken } = session || {};

  return (
    <>
      <Head>
        <title>Movie Polls</title>
        <meta
          name="description"
          content="Create movie polls and let everyone decide the winner."
        />
        <meta name="csrf-token" content={csrfToken} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}; 

export default Layout;
