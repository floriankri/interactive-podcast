import { useEffect, useState } from 'react';
import { SearchBar } from "@/components/SearchBar";
import { PodcastCard } from "@/components/PodcastCard";
import { mockPodcastSeries } from "@/data/mockData";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PodcastPlayer } from '@/components/PodcastPlayer';

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
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Fetch the transcript when the component mounts
    fetch('/vercel_acq2_transcript.txt')
      .then(response => response.text())
      .then(text => setTranscript(text))
      .catch(error => console.error('Error loading transcript:', error));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-32">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Podcast Q&A Demo
          </h1>
          <div className="mt-8">
            <PodcastPlayer 
              audioSrc="/vercel_acq2.mp3" 
              transcript={transcript}
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
