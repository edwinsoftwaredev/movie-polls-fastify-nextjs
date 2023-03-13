import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Card from 'src/components/Card';
import trpc from 'src/trpc/server';
import { InferQueryOutput } from 'trpc/client/utils';
import styles from './Account.module.scss';
import { DeleteAccountAction } from './ClientComponents';

const getData = async () => {
  const { whoami } = await trpc.query(
    'account',
    'whoami',
    undefined,
    headers()
  );

  return { whoami };
};

const ProfileData: React.FC<{
  whoami: NonNullable<InferQueryOutput<'account'>['whoami']['whoami']>;
}> = ({ whoami }) => {
  return (
    <Card header={{}}>
      <div className={styles['account-profile']}>
        <div className={styles['account-picture']}>
          <Image
            src={whoami.picture ?? ''}
            alt={whoami.picture ?? ''}
            placeholder={'empty'}
            loading={'lazy'}
            fill={true}
            quality={100}
          />
        </div>
        <div>
          <p>
            You are signed in as <b>{whoami.email}</b>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default async function Page() {
  const data = await getData();
  const { whoami } = data;

  if (!whoami) redirect('/');

  return (
    <div className={styles['account-container']}>
      <Card
        header={{
          content: (
            <div className={styles['header']}>
              <h3>Account</h3>
            </div>
          ),
        }}
      >
        <div className={styles['account']}>
          <ProfileData whoami={whoami} />
          <div className={styles['settings']}>
            <div className={styles['settings-item']}>
              <div className={styles['settings-item-title']}>
                <h4>Delete account</h4>
              </div>
              <div className={styles['settings-item-content']}>
                <div>Deleting your account will:</div>
                <ul>
                  <li>Delete your polls</li>
                  <li>Delete your invites</li>
                  <li>
                    Delete your profile
                    <ul>
                      <li>Email</li>
                      <li>Display Name</li>
                      <li>Profile Picture</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div className={styles['settings-item-actions']}>
                <DeleteAccountAction />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
