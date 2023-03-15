import style from './Contact.module.scss';

export const metadata = {
  title: 'Contact',
};

export default async function Page() {
  return (
    <div className={style['main']}>
      <span>Contact</span>
    </div>
  );
}
