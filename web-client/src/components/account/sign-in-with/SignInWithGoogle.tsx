import React from 'react';
import Script from 'next/script';

const SignInWithGoogle: React.FC = () => {
  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <div
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_OAUTH2_CLIENT_ID}
        data-login_uri={`${process.env.NEXT_PUBLIC_API_HOST_URL}/trpc/sign-in/with-google`}
        data-auto_prompt="false"
        data-ux_mode="popup"
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}
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
