
import { SearchBar } from "@/components/SearchBar";
import { PodcastCard } from "@/components/PodcastCard";
import { mockPodcastSeries } from "@/data/mockData";

const Index = () => {
  return (
    <div className="min-h-screen">
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
