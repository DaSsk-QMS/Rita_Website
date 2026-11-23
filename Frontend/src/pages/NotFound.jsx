import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrainFront } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <meta name="robots" content="noindex" />
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-secondary px-4 pt-24 text-center text-white">
        <div className="absolute inset-x-0 bottom-1/3 h-1 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.25)_0_30px,transparent_30px_50px)]" />
        <div className="relative">
          <motion.div animate={{ x: [-200, 200] }} transition={{ repeat: Infinity, repeatType: 'mirror', duration: 4, ease: 'easeInOut' }} className="mx-auto mb-6 w-fit text-accent">
            <TrainFront size={64} />
          </motion.div>
          <h1 className="font-heading text-8xl font-extrabold sm:text-9xl">404</h1>
          <p className="mt-4 text-xl text-white/70">This train doesn't stop here. The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn-accent mt-10"><ArrowLeft size={18} /> Back to home</Link>
        </div>
      </section>
    </>
  );
}
