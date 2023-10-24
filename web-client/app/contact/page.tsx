import styles from './Contact.module.scss';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Contact',
};

export default async function Page() {
  return (
    <article className={styles['contact']}>
      <h2>Contact</h2>
      <section>
        <div className={styles['content']}>
          <span className={styles['emoji']}>&#128075;</span>
          <a target={'_blank'} href="https://github.com/edwinsoftwaredev">
            https://github.com/edwinsoftwaredev
          </a>
        </div>
      </section>
    </article>
  );
}
