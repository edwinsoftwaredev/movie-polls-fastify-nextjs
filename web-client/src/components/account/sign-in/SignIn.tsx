import React from 'react';
import { SignInWithGoogle } from '../sign-in-with';

const SignIn: React.FC = () => {
  // Add passport/api logic here
  return (
    <div>
      <div>
        <h3>You are not authenticated!</h3>
      </div>
      <div>
        <SignInWithGoogle />
      </div>
    </div>
  );
};

export default SignIn;
