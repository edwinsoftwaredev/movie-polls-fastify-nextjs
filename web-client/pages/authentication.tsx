import { NextPage } from 'next';
import Script from 'next/script';

const Authentication: NextPage = () => {
  return (
    <Script
      id="google-client-library"
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
    />
  );
};

export default Authentication;
