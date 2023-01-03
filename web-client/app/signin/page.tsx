import { headers } from 'next/headers';
import { getTRPCClient } from 'src/trpc/server';
import SignIn from './SignIn';

export default async function Page() {
  const { account } = getTRPCClient(headers(), 'accountRoutes');
  const { whoami } = await account.whoami.query();

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
