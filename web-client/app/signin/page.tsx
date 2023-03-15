import type { Metadata } from 'next';
import { headers } from 'next/headers';
import trpc from 'src/trpc/server';
import SignIn from './SignIn';

export async function generateMetadata({}): Promise<Metadata> {
  const { csrfToken } = await trpc.query(
    'session',
    'getSession',
    undefined,
    headers()
  );
  return { title: 'Sign In', other: { 'csrf-token': csrfToken } };
}

export default async function Page() {
  const { whoami } = await trpc.query(
    'account',
    'whoami',
    undefined,
    headers()
  );

  return (
    <section>
      <article>
        {whoami ? (
          <h2>
            Welcome <span>{whoami.displayName}</span>
          </h2>
        ) : (
          <SignIn />
        )}
      </article>
    </section>
  );
}
