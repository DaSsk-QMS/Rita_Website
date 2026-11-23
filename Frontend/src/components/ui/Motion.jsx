import { motion, useInView, animate } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSite } from '../../context/SiteContext.jsx';

const variants = {
  up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  blur: { hidden: { opacity: 0, filter: 'blur(12px)', y: 20 }, show: { opacity: 1, filter: 'blur(0px)', y: 0 } },
  flip: { hidden: { opacity: 0, rotateX: -35, y: 30, transformPerspective: 900 }, show: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 900 } },
};
export const ANIMATION_STYLES = Object.keys(variants);

/**
 * Scroll-reveal wrapper. Style, speed and on/off are controlled in Admin › Theme.
 * `from` forces a direction; otherwise the site-wide animation style is used.
 */
export function Reveal({ children, from, delay = 0, duration = 0.7, className = '', as = 'div', ...rest }) {
  const { settings } = useSite();
  const theme = settings.theme || {};
  const Comp = motion[as] || motion.div;
  if (theme.animations === false) {
    const Tag = as;
    return <Tag className={className} {...rest}>{children}</Tag>;
  }
  const style = theme.animationStyle && theme.animationStyle !== 'up' && (!from || from === 'up') ? theme.animationStyle : from || 'up';
  const speed = Number(theme.animationSpeed) || 1;
  return (
    <Comp
      className={className}
      variants={variants[style] || variants.up}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: duration * speed, delay: delay * speed, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Word-by-word animated heading. */
export function SplitText({ text = '', className = '', delay = 0, as = 'span' }) {
  const { settings } = useSite();
  const Tag = as;
  if (settings.theme?.animations === false) return <Tag className={className}>{text}</Tag>;
  const words = String(text).split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** 3D tilt on hover (desktop pointer only). */
export function Tilt({ children, className = '', max = 8 }) {
  const ref = useRef(null);
  const { settings } = useSite();
  const enabled = settings.theme?.animations !== false;
  const onMove = (e) => {
    const el = ref.current;
    if (!el || !enabled || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`transition-transform duration-300 ease-out will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/** Sets --mx / --my on the element so `.spotlight` cards glow under the cursor. */
export function useSpotlight() {
  return useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
}

/** Magnetic hover for buttons. */
export function Magnetic({ children, strength = 0.25, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ''; };
  return <span ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`inline-block transition-transform duration-300 ease-out ${className}`}>{children}</span>;
}

export function Counter({ value = 0, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const c = animate(0, Number(value) || 0, { duration, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, duration]);
  return (
    <span ref={ref}>
      {n.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}
