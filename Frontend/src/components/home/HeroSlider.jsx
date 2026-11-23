import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, EffectCreative, Pagination, Navigation, Keyboard, A11y } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ChevronsDown } from 'lucide-react';
import { img } from '../../lib/api.js';
import { SplitText, Magnetic } from '../ui/Motion.jsx';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

const item = (d) => ({ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.8, ease: [0.22, 1, 0.36, 1] } });

export default function HeroSlider({ slides = [], home = {} }) {
  const [active, setActive] = useState(0);
  if (!slides.length) return null;
  const effect = home.sliderEffect || 'fade';
  const autoplay = home.sliderAutoplay !== false;
  const delay = Number(home.sliderDelay) || 6000;

  return (
    <section className="relative h-[100svh] min-h-[640px] bg-secondary">
      <Swiper
        className="hero-swiper h-full"
        modules={[Autoplay, EffectFade, EffectCreative, Pagination, Navigation, Keyboard, A11y]}
        effect={effect === 'slide' ? 'slide' : effect}
        fadeEffect={{ crossFade: true }}
        creativeEffect={{ prev: { shadow: true, translate: ['-20%', 0, -1] }, next: { translate: ['100%', 0, 0] } }}
        speed={1100}
        loop={slides.length > 1}
        keyboard
        autoplay={autoplay ? { delay, disableOnInteraction: false } : false}
        pagination={{ clickable: true }}
        navigation={{ prevEl: '.hero-prev', nextEl: '.hero-next' }}
        onSlideChange={(s) => setActive(s.realIndex)}
      >
        {slides.map((s, i) => (
          <SwiperSlide key={s._id || i} className="relative overflow-hidden">
            <img
              src={img(s.image)} alt={s.title}
              className={`absolute inset-0 h-full w-full object-cover ${active === i ? 'animate-kenburns' : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/75 to-secondary/10" style={{ opacity: 'var(--hero-overlay)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-secondary/40" />
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-[0.07] [mask-image:linear-gradient(90deg,#000,transparent_60%)]" />

            <div className="container-x relative flex h-full items-center pt-24">
              {active === i && (
                <div className="max-w-3xl text-white">
                  {s.subtitle && (
                    <motion.span {...item(0.1)} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> {s.subtitle}
                    </motion.span>
                  )}
                  <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-7xl">
                    <SplitText text={s.title} delay={0.2} />
                  </h1>
                  {s.description && <motion.p {...item(0.45)} className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-xl">{s.description}</motion.p>}
                  <motion.div {...item(0.65)} className="mt-10 flex flex-wrap gap-4">
                    {s.buttonText && <Magnetic><Link to={s.buttonLink || '/services'} className="btn-accent !px-8 !py-4">{s.buttonText} <ArrowRight size={18} /></Link></Magnetic>}
                    {s.button2Text && <Link to={s.button2Link || '/contact'} className="btn-outline !px-8 !py-4">{s.button2Text}</Link>}
                  </motion.div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Autoplay progress */}
      {autoplay && slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/10">
          <div key={active} className="hero-progress h-full bg-accent" style={{ animationDuration: `${delay}ms` }} />
        </div>
      )}

      {/* Controls + slide counter */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10">
        <div className="container-x flex items-center justify-end gap-3">
          <span className="mr-4 font-heading text-sm text-white/70"><span className="text-2xl font-bold text-white">{String(active + 1).padStart(2, '0')}</span> / {String(slides.length).padStart(2, '0')}</span>
          <button className="hero-prev pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white backdrop-blur transition hover:bg-accent hover:text-secondary" aria-label="Previous slide"><ChevronLeft /></button>
          <button className="hero-next pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-white/30 text-white backdrop-blur transition hover:bg-accent hover:text-secondary" aria-label="Next slide"><ChevronRight /></button>
        </div>
      </div>
      <a href="#about" className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-white/60 md:flex" aria-label="Scroll down">
        <ChevronsDown className="animate-bounce" />
      </a>
    </section>
  );
}
