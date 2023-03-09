'use client';

import { useEffect, useState } from 'react';

const ExpiresOn: React.FC<{ expiresOn: string }> = ({ expiresOn }) => {
  const [endsOn, setEndsOn] = useState<string>();

  useEffect(() => {
    setEndsOn(
      new Date(expiresOn).toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    );
  }, [expiresOn]);

  return <span>{endsOn ?? ''}</span>;
};

export default ExpiresOn;
