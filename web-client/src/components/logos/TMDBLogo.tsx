'use client';

import TMBDLogoVector from 'public/tmdb-logos/blue_short.svg';

const TMBDLogo: React.FC<{ width?: string }> = ({ width }) => (
  <TMBDLogoVector width={width} />
);

export default TMBDLogo;
