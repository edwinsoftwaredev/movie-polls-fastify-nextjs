'use client';

import { Button } from 'components';
import { useRouter } from 'next/navigation';
import trpc from 'src/trpc/client';

export const DeleteAccountAction: React.FC = () => {
  const { mutate } = trpc.privateAccount.delete.useMutation();
  const router = useRouter();

  return (
    <Button
      del
      onClick={() => {
        mutate(undefined, {
          onSuccess: () => {
            router.refresh();
          },
        });
      }}
    >
      DELETE YOUR ACCOUNT
    </Button>
  );
};
