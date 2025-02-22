
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
      <div className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-32">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-20 animate-fadeIn">
            Interactive Podcast Experience
          </h1>
          <div className="max-w-4xl mx-auto">
            <AudioPlayer
              audioUrl={defaultEpisode.audioUrl}
              title={defaultEpisode.title}
              author={defaultSeries.author}
            />
          </div>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="page-container">
        <h2 className="text-2xl font-semibold mb-6">Popular Podcasts</h2>
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
