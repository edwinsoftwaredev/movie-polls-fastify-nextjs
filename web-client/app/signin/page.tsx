import { headers } from 'next/headers';
import { trpc } from 'src/trpc/server';
import SignIn from './SignIn';

export default async function Page() {
  const reqHeaders = headers();
  const { whoami } = await trpc.query('account:whoami', reqHeaders);

  return (
    <section>
      <article>
        {whoami ? (
          <h2>
            Welcome <span>{whoami.displayName}</span>
          </h2>
        ) : (
          <>
            <span style={{ textAlign: 'center' }}>
              <h2>You are not authenticated</h2>
            </span>
            <SignIn />
          </>
        )}
      </article>
    </section>
  );
}
