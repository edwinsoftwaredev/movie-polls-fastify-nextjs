'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

const SignInWithGoogle: React.FC = () => {
  // RE-RENDERING a page that contains a script,
  // and such script attaches itself to an element in the page
  // is not going to make the script to re-attach itself to the element
  // in the page again (<Script /> persist during routing or page rerenders).
  // Because of that script must be re-attached manually after the
  // component/page has been rendered.
  //
  // https://nextjs.org/docs/messages/next-script-for-ga
  useEffect(() => {
    window.google?.accounts.id.renderButton(
      document.getElementById('g_id_signin'),
      {
        type: 'standard',
        theme: 'outlined',
        size: 'large',
        text: 'sign_in_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      }
    );
  }, []);

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <div
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_OAUTH2_CLIENT_ID}
        data-login_uri={`${process.env.NEXT_PUBLIC_API_HOST_URL}/trpc/googleAuthRoutes/googleAuth.verifyGoogleIDToken`}
        data-auto_prompt="false"
        data-ux_mode="popup"
      />
      <div
        id="g_id_signin"
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outlined"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left"
      />
    </div>
  );
};

export default SignInWithGoogle;
