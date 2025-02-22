
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, HelpCircle } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { mockPodcastSeries } from "@/data/mockData";
import type { Episode } from "@/types/podcast";

const PodcastSeries = () => {
  const { id } = useParams();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  
  const series = mockPodcastSeries.find((s) => s.id === Number(id));
  
  if (!series) {
    return <div>Series not found</div>;
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="page-container">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Browse
          </Link>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 h-48 flex-shrink-0">
              <img
                src={series.coverImage}
                alt={series.title}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{series.author}</p>
              <p className="text-gray-600 mb-4">{series.description}</p>
              <div className="flex items-center gap-2 text-primary">
                <HelpCircle size={20} />
                <p className="text-sm">
                  Interactive Experience: Click "Ask a Question" during playback to get instant voice answers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="page-container">
        <h2 className="text-2xl font-semibold mb-6">Episodes</h2>
        <div className="space-y-4">
          {series.episodes.map((episode) => (
            <div
              key={episode.id}
              onClick={() => setSelectedEpisode(episode)}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <button className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                  <Play size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{episode.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{episode.description}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>{episode.publishedAt}</span>
                  <span>{episode.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Player */}
      {selectedEpisode && (
        <AudioPlayer
          audioUrl={selectedEpisode.audioUrl}
          title={selectedEpisode.title}
          author={series.author}
        />
      )}
    </div>
  );
};

export default PodcastSeries;
