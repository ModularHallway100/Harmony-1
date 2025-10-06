import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Play } from 'lucide-react';
interface ContentCardProps {
  item: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    coverArt?: string;
    profileImage?: string;
  };
  type: 'artist' | 'playlist' | 'user-artist';
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};
const ContentCard: React.FC<ContentCardProps> = ({ item, type }) => {
  const title = item.title || item.name || 'Untitled';
  const image = item.coverArt || item.profileImage || 'https://picsum.photos/400';
  const linkTo = type === 'user-artist' ? `/user-artist/${item.id}` : `/${type}/${item.id}`;
  return (
    <motion.div variants={cardVariants}>
      <Link to={linkTo} className="block group relative">
        <div
          className="bg-neutral-900 p-4 rounded-md transition-all duration-300 ease-in-out hover:bg-neutral-800/80 border border-transparent hover:border-cyan-500/50"
        >
          <div className="relative">
            <img
              src={image}
              alt={title}
              className={`w-full aspect-square object-cover ${type === 'artist' || type === 'user-artist' ? 'rounded-full' : 'rounded-md'}`}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute bottom-2 right-2 w-12 h-12 bg-magenta rounded-full flex items-center justify-center shadow-lg shadow-magenta/50 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
            >
              <Play className="w-6 h-6 text-white fill-current ml-1" />
            </motion.div>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-lg truncate text-white">{title}</h3>
            <p className="text-sm text-gray-400 truncate mt-1">{item.description || (type.includes('artist') ? 'Artist' : 'Playlist')}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
export default ContentCard;