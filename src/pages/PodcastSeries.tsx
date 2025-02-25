import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, HelpCircle } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { mockPodcastSeries } from "@/data/mockData";
import type { Episode } from "@/types/podcast";

const PodcastSeries = () => {
  const { id } = useParams();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const series = mockPodcastSeries.find(s => s.id === Number(id));
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");

  if (!series) {
    return <div>Series not found</div>;
  }

  const handlePlayClick = (episode: Episode) => {
    setSelectedEpisode(episode);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="page-container">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft size={16} className="mr-2" />
            Back to Browse
          </Link>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 h-48 flex-shrink-0">
              <img src={series.coverImage} alt={series.title} className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{series.author}</p>
              <p className="text-gray-600 mb-4">{series.description}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <HelpCircle size={20} />
                  <p className="text-sm">Interactive Experience: Click "Join in!" during playback to instantly talk with the podcast hosts.</p>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                    Beta
                  </span>
                  <p className="text-sm">
                    This is a <strong>vision</strong> on how the system can be filled with content. While <strong>many functions work</strong> in the podcasts below, we <strong>did not have consent to clone the voice</strong> of the hosts or access to precise <strong>transcripts</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="page-container">
        <h2 className="text-2xl font-semibold mb-6">Episodes</h2>
        <div className="space-y-4">
          {series.episodes.map(episode => (
            <div 
              key={episode.id} 
              onClick={() => handlePlayClick(episode)} 
              className="p-4 rounded-lg border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <button 
                  className="h-10 w-10 rounded-full flex items-center justify-center text-primary transition-colors bg-black/0 hover:bg-primary/10 text-base font-normal"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick(episode);
                  }}
                >
                  <Play size={20} className="ml-1 group-hover:fill-primary transition-colors hover:fill-foreground" />
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
          onTranscriptToggle={setIsTranscriptVisible}
          isTranscriptVisible={isTranscriptVisible}
          currentTranscript={currentTranscript}
          fullTranscript={fullTranscript}
          transcriptlocation={selectedEpisode.transcriptlocation}
          isMainPage={true}
        />
      )}
    </div>
  );
};

export default PodcastSeries;
