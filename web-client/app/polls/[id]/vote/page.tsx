import Vote from './Vote';

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { vt: string };
}) {
  const { id } = params;
  const { vt } = searchParams;
  
  return <Vote />;
}
