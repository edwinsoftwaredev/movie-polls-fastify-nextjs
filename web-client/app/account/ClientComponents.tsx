'use client';

import { Button } from 'components';
import trpc from 'src/trpc/client';

export const DeleteAccountAction: React.FC = () => {
  const { mutate } = trpc.privateAccount.delete.useMutation();
  const { data: sessionData } = trpc.session.getSession.useQuery(undefined, {
    enabled: false,
  });

  return (
    <form
      method="post"
      action={`${process.env.NEXT_PUBLIC_API_HOST_URL}/trpc/accountRoutes/account.logout`}
    >
      <input type="hidden" name="_csrf" value={sessionData?.csrfToken || ''} />
      <Button
        del
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          mutate(undefined, {
            onSuccess: async () => {
              (e.target as any).form?.requestSubmit();
            },
          });
        }}
      >
        DELETE YOUR ACCOUNT
      </Button>
    </form>
  );
};
