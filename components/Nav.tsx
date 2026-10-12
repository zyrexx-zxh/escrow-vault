'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { LogoMark } from './icons';

export default function Nav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav
        aria-label="Primary"
        className="glass flex w-full max-w-3xl items-center justify-between rounded-full py-2 pl-5 pr-2"
      >
        <a href="#top" className="flex items-center gap-2.5 text-sm font-medium tracking-wide text-white">
          <LogoMark className="h-5 w-5 text-emerald-300" />
          <span>
            Escrow<span className="text-emerald-300">Vault</span>
          </span>
        </a>

        <div className="flex items-center gap-1 text-[13px] text-white/70">
          <a
            href="#how"
            className="hidden rounded-full px-3.5 py-2 transition hover:bg-white/10 hover:text-white sm:block"
          >
            How it works
          </a>
          <a
            href="#directory"
            className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
          >
            Directory
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
