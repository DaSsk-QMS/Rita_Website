import { useSite } from '../context/SiteContext.jsx';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, Html } from '../components/ui/Common.jsx';

export default function Legal({ page }) {
  const { settings } = useSite();
  const title = page === 'privacy' ? 'Privacy Policy' : 'Terms of Use';
  return (
    <>
      <Seo title={title} />
      <PageHero title={title} crumbs={[{ label: title }]} />
      <section className="py-20">
        <div className="container-x max-w-4xl"><Html html={settings.pages?.[page]} /></div>
      </section>
    </>
  );
}
