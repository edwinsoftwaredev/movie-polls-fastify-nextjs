'use client';

import { Button } from 'components';
import { useRouter } from 'next/navigation';
import trpc from 'src/trpc/client';

export const DeleteAccountAction: React.FC = () => {
  const context = trpc.useContext();
  const { mutate } = trpc.privateAccount.delete.useMutation();
  const router = useRouter();

  return (
    <Button
      del
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutate(undefined, {
          onSuccess: async () => {
            await context.session.invalidate(undefined);
            router.refresh();
          },
        });
      }}
    >
      DELETE YOUR ACCOUNT
    </Button>
  );
};
