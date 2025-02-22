
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PodcastCard } from "@/components/PodcastCard";
import { AudioPlayer } from "@/components/AudioPlayer";

// Mock data (replace with real API calls later)
const mockPodcasts = [
  {
    id: 1,
    title: "The Daily Bits",
    author: "Tech Media",
    coverImage: "https://picsum.photos/seed/1/400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Future Forward",
    author: "Innovation Hub",
    coverImage: "https://picsum.photos/seed/2/400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Design Matters",
    author: "Creative Minds",
    coverImage: "https://picsum.photos/seed/3/400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "Code Stories",
    author: "Dev Team",
    coverImage: "https://picsum.photos/seed/4/400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Startup Journey",
    author: "Entrepreneur Weekly",
    coverImage: "https://picsum.photos/seed/5/400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 6,
    title: "Digital Horizons",
    author: "Tech Visionaries",
    coverImage: "https://picsum.photos/seed/6/400",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
];

const Index = () => {
  const [selectedPodcast, setSelectedPodcast] = useState<typeof mockPodcasts[0] | null>(null);

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-32">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">
            Discover Your Next Favorite Podcast
          </h1>
          <p className="text-lg text-gray-600 mb-8 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            Search through millions of podcasts and find the perfect one for you
          </p>
          <div className="flex justify-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="page-container">
        <h2 className="text-2xl font-semibold mb-6">Popular Podcasts</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockPodcasts.map((podcast) => (
            <div key={podcast.id} className="animate-fadeIn">
              <PodcastCard
                title={podcast.title}
                author={podcast.author}
                coverImage={podcast.coverImage}
                onClick={() => setSelectedPodcast(podcast)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Audio Player */}
      {selectedPodcast && (
        <AudioPlayer
          audioUrl={selectedPodcast.audioUrl}
          title={selectedPodcast.title}
          author={selectedPodcast.author}
        />
      )}
    </div>
  );
};

export default Index;
