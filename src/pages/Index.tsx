import { PodcastCard } from "@/components/PodcastCard";
import { mockPodcastSeries } from "@/data/mockData";
import { AudioPlayer } from "@/components/AudioPlayer";

const Index = () => {
  // Use the first episode of the first series as the default content
  const defaultSeries = mockPodcastSeries[0];
  const defaultEpisode = defaultSeries.episodes[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-20 animate-fadeIn">
            Interactive Podcast Experience
          </h1>
          <div className="animate-fadeIn z-50 relative">
            <AudioPlayer
              audioUrl={defaultEpisode.audioUrl}
              title={defaultEpisode.title}
              author={defaultSeries.author}
            />
          </div>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="page-container py-[150px]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-semibold">Popular Podcasts</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
            Beta
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockPodcastSeries.map((podcast) => (
            <div key={podcast.id} className="animate-fadeIn">
              <PodcastCard
                id={podcast.id}
                title={podcast.title}
                author={podcast.author}
                description={podcast.description}
                coverImage={podcast.coverImage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
