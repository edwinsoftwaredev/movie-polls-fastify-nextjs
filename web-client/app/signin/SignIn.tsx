import React from 'react';
import { SignInWithGoogle } from './sign-in-with';

const SignIn: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '400px',
        minHeight: '100px',
      }}
    >
      <SignInWithGoogle />
    </div>
  );
};

export default SignIn;
