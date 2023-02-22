import { Voltaire } from '@next/font/google';
import React from 'react';
import Card from 'src/components/Card';
import { SignInWithGoogle } from './sign-in-with';
import styles from './SignIn.module.scss';

const voltaire = Voltaire({
  weight: '400',
});

const SignIn: React.FC = () => {
  return (
    <div className={styles['sign-in-container']}>
      <Card
        header={{
          content: (
            <div className={styles['sign-in-header']}>
              <h2 className={`app-title ${voltaire.className}`}>Movie Polls</h2>
              <h2 className={styles['sign-in-title']}>Sign In</h2>
            </div>
          ),
        }}
      >
        <div className={styles['sign-in-body-card']}>
          <SignInWithGoogle />
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
