import React from 'react';
import { motion } from 'framer-motion';
import { artists, playlists } from '@/lib/mock-data';
import ContentCard from '@/components/shared/ContentCard';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-cyan">Featured AI Artists</h2>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {artists.map((artist) => (
            <ContentCard key={artist.id} item={artist} type="artist" />
          ))}
        </motion.div>
      </section>
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-lime">Trending Playlists</h2>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {playlists.map((playlist) => (
            <ContentCard key={playlist.id} item={playlist} type="playlist" />
          ))}
        </motion.div>
      </section>
    </div>
  );
};