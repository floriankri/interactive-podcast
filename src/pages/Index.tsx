
import { PodcastCard } from "@/components/PodcastCard";
import { mockPodcastSeries } from "@/data/mockData";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { BlueShader } from "@/components/BlueShader";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const educationImages = [
    {
      src: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      alt: "Technology in Education",
      title: "Digital Learning",
      description: "Modern tech-enabled education"
    },
    {
      src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      alt: "Programming Education",
      title: "Coding Education",
      description: "Learn programming fundamentals"
    },
    {
      src: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
      alt: "Software Development",
      title: "Software Skills",
      description: "Master software development"
    },
    {
      src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      alt: "Focused Learning",
      title: "Focused Study",
      description: "Immersive learning environment"
    }
  ];

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
          <div className="pointer-events-auto">
            <AudioPlayer
              audioUrl={defaultEpisode.audioUrl}
              title={defaultEpisode.title}
              author={defaultSeries.author}
              onTimeUpdate={setCurrentTime}
              onTranscriptToggle={setIsTranscriptVisible}
              isTranscriptVisible={isTranscriptVisible}
              currentTranscript={currentTranscript}
              fullTranscript={fullTranscript}
              transcriptlocation={defaultEpisode.transcriptlocation}
              isMainPage={true}
            />
            <TranscriptDisplay 
              currentTime={currentTime} 
              onWordUpdate={setDisplayedWord}
              onSpeakerUpdate={setCurrentSpeaker}
              onSpeakersUpdate={setUniqueSpeakers}
              isVisible={false}
              onTranscriptUpdate={setCurrentTranscript}
              onFullTranscriptUpdate={setFullTranscript}
              transcriptlocation={defaultEpisode.transcriptlocation}
            />
          </div>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="page-container py-[150px] pointer-events-auto relative z-[1]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-semibold">Popular Podcasts</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                  Beta
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] bg-black text-white p-3 rounded-lg">
                <p className="text-sm">
                  This is a vision on how the system can be filled with content. While many functions work in the podcasts below, we did not have consent to clone the hosts voice or access to precise transcripts.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

      {/* Education Grid */}
      <div className="page-container pb-[150px] pointer-events-auto relative z-[1]">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-semibold">Popular Education in an Alpha phase</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                  Alpha
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] bg-black text-white p-3 rounded-lg">
                <p className="text-sm">
                  Early access to educational content and features. Currently in testing phase.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {educationImages.map((item, index) => (
            <div key={index} className="animate-fadeIn">
              <div className="group relative overflow-hidden rounded-xl hover-scale">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 w-full glass-morphism">
                    <h3 className="text-white font-semibold truncate">{item.title}</h3>
                    <p className="text-white/80 text-sm truncate">{item.description}</p>
                  </div>
                </div>
              </div>
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
