import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, HelpCircle } from "lucide-react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  author: string;
}

export const AudioPlayer = ({ audioUrl, title, author }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(audioRef.current.currentTime + seconds, 0),
        duration
      );
    }
  };

  const handleAskQuestion = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    toast({
      title: "Ask a Question",
      description: "Playback paused. What would you like to ask about this segment?",
    });
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeChange = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0];
      setVolume(newVolume[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 animate-slideUp">
      <audio ref={audioRef} src={audioUrl} />
      <div className="container mx-auto max-w-4xl">
        {/* Progress Bar Section */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleTimeChange}
          />
          <div className="flex justify-between text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Title and Author - Left */}
          <div className="text-left">
            <h3 className="font-bold text-base truncate">{author}</h3>
            <p className="text-sm text-gray-500 truncate">{title}</p>
          </div>

          {/* Play and Ask Question Buttons - Center */}
          <div className="flex items-center justify-center gap-6">
            {/* Backward 10s button */}
            <button
              onClick={() => skipTime(-10)}
              className="relative flex items-center justify-center group"
            >
              <div className="h-9 w-9 relative">
                <div className="absolute inset-0 border-2 border-primary rounded-tl-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-primary">
                  10
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 
                               border-l-[6px] border-l-transparent
                               border-b-[8px] border-b-primary
                               border-r-[6px] border-r-transparent
                               rotate-[-90deg] origin-bottom" />
              </div>
            </button>
            
            <button
              onClick={togglePlay}
              className="h-12 w-12 flex items-center justify-center"
            >
              <div className="w-9 h-9 flex items-center justify-center">
                {isPlaying ? (
                  <div className="flex gap-1.5">
                    <div className="h-9 w-3 bg-foreground"></div>
                    <div className="h-9 w-3 bg-foreground"></div>
                  </div>
                ) : (
                  <Play size={36} fill="black" className="ml-1" />
                )}
              </div>
            </button>

            {/* Forward 10s button */}
            <button
              onClick={() => skipTime(10)}
              className="relative flex items-center justify-center group"
            >
              <div className="h-9 w-9 relative">
                <div className="absolute inset-0 border-2 border-primary rounded-tr-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-primary">
                  10
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 
                               border-l-[6px] border-l-transparent
                               border-b-[8px] border-b-primary
                               border-r-[6px] border-r-transparent
                               rotate-90 origin-bottom" />
              </div>
            </button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleAskQuestion}
            >
              <HelpCircle size={16} />
              Ask a Question
            </Button>
          </div>

          {/* Volume Controls - Right */}
          <div className="flex items-center gap-2 justify-end">
            <button onClick={toggleMute}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
