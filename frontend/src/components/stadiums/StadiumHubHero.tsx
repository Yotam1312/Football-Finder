import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { StadiumSearchInput } from './StadiumSearchInput';

// Hero banner for the Stadium Guide hub page.
// Dark slate gradient — distinct from FanBase's green hero and the match pages.
// The search bar lives inside the hero so it's the first thing users see.
export const StadiumHubHero: React.FC = () => {
  return (
    <section
      className="text-white py-14 px-4"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <MapPin className="w-10 h-10 mx-auto mb-4 text-slate-400" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Stadium Guide
          </h1>
          <p className="text-slate-400 text-lg font-light mb-8">
            Explore stadiums, transport links, and fan tips for venues worldwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <StadiumSearchInput />
        </motion.div>
      </div>
    </section>
  );
};
