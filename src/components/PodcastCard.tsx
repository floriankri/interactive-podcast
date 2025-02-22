
import { PlayCircle } from "lucide-react";

interface PodcastCardProps {
  title: string;
  author: string;
  coverImage: string;
  onClick: () => void;
}

export const PodcastCard = ({ title, author, coverImage, onClick }: PodcastCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl hover-scale cursor-pointer"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="p-4 w-full glass-morphism">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          <p className="text-white/80 text-sm truncate">{author}</p>
          <PlayCircle className="absolute bottom-4 right-4 text-white" size={24} />
        </div>
      </div>
    </div>
  );
};
