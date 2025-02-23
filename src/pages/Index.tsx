import { PodcastCard } from "@/components/PodcastCard";
import { mockPodcastSeries } from "@/data/mockData";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { BlueShader } from "@/components/BlueShader";
import { useState } from "react";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [displayedWord, setDisplayedWord] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [uniqueSpeakers, setUniqueSpeakers] = useState<Set<string>>(new Set());
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  // Use the first episode of the first series as the default content
  const defaultSeries = mockPodcastSeries[0];
  const defaultEpisode = defaultSeries.episodes[0];

  return (
    <div className="min-h-screen">
      <BlueShader currentWord={displayedWord} position="left" currentSpeaker={currentSpeaker} uniqueSpeakers={uniqueSpeakers} />
      <BlueShader currentWord={displayedWord} position="center" currentSpeaker={currentSpeaker} uniqueSpeakers={uniqueSpeakers} />
      <BlueShader currentWord={displayedWord} position="right" currentSpeaker={currentSpeaker} uniqueSpeakers={uniqueSpeakers} />
      {/* Hero Section */}
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center pointer-events-none relative z-[2]">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-20 animate-fadeIn">
            Interactive Podcast Experience
          </h1>
          <div className="animate-fadeIn pointer-events-auto">
            <AudioPlayer
              audioUrl={defaultEpisode.audioUrl}
              title={defaultEpisode.title}
              author={defaultSeries.author}
              onTimeUpdate={setCurrentTime}
              onTranscriptToggle={setIsTranscriptVisible}
              isTranscriptVisible={isTranscriptVisible}
              currentTranscript={currentTranscript}
              fullTranscript={fullTranscript}
            />
            <TranscriptDisplay 
              currentTime={currentTime} 
              onWordUpdate={setDisplayedWord}
              onSpeakerUpdate={setCurrentSpeaker}
              onSpeakersUpdate={setUniqueSpeakers}
              isVisible={false}
              onTranscriptUpdate={setCurrentTranscript}
              onFullTranscriptUpdate={setFullTranscript}
            />
          </div>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="page-container py-[150px] pointer-events-auto relative z-[1]">
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
      {/* Add padding at the bottom for the fixed media player */}
      <div className="pb-[120px]"></div>
    </div>
  );
};

export default Index;
