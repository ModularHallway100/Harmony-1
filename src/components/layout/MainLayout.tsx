import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import MusicPlayer from './MusicPlayer';
import { usePlayerStore } from '@/store/player-store';
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
} as const;
const MainLayout: React.FC = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const location = useLocation();
  return (
    <div className="flex h-screen bg-neutral-950 text-gray-200 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`max-w-8xl mx-auto space-y-12 ${currentTrack ? 'pb-24' : ''}`}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {currentTrack && <MusicPlayer />}
    </div>
  );
};
export default MainLayout;