import React from 'react';
import { SignInWithGoogle } from '../sign-in-with';

const SignIn: React.FC = () => {
  return (
    <div>
      <div 
        style={{
          textAlign: 'center'
        }}
      >
        <h3>You are not authenticated!</h3>
      </div>
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
    </div>
  );
};

export default SignIn;
