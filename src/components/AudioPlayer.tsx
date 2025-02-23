import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Hand } from "lucide-react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { ConversationHandler } from "./ConversationHandler";
import { useConversation } from '@11labs/react';
import { useConversationContext } from '@/contexts/ConversationContext';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  author: string;
  onTimeUpdate?: (time: number) => void;
}

export const AudioPlayer = ({ audioUrl, title, author, onTimeUpdate }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { agentId } = useConversationContext();
  const conversation = useConversation();

  // API-related state
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const conversationRef = useRef<any>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", () => {
        const time = audioRef.current?.currentTime || 0;
        setCurrentTime(time);
        onTimeUpdate?.(time);
      });
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }
  }, [onTimeUpdate]);

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

  const handleAskQuestion = async () => {
    // ... API functionality
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

  const [isStoppingIntentionally, setIsStoppingIntentionally] = useState(false);

  const handleJoinIn = async () => {
    if (isRecording) {
      console.log('Stopping conversation...');
      setIsStoppingIntentionally(true);
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      // End conversation session
      if (conversationRef.current?.endSession) {
        await conversationRef.current.endSession();
      }
    } else {
      console.log('Starting conversation...');
      setIsStoppingIntentionally(false);
      if (!agentId) {
        toast({
          title: "Error",
          description: "Agent not initialized. Please try again.",
        });
        return;
      }
      // Start conversation session first
      try {
        await conversationRef.current?.startSession();
        // Then start recording
        await startRecording();
      } catch (error) {
        console.error('Error starting conversation:', error);
        toast({
          title: "Error",
          description: "Could not start conversation. Please try again.",
        });
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  // Add this near the top of your AudioPlayer component:
  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudioContext = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContext.resume();
      document.removeEventListener('click', initAudioContext);
    };
    
    document.addEventListener('click', initAudioContext);
    return () => document.removeEventListener('click', initAudioContext);
  }, []);

  // Remove the cleanup effect that was using the deprecated disconnect
  useEffect(() => {
    return () => {
      // Just cleanup the media recorder if it exists
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <ConversationHandler 
        onMessage={(message) => {
          console.log('Agent message:', message);
          if (message.type === 'asr_event') {
            console.log('Transcribed text:', message.asr_event?.text);
          } else if (message.type === 'agent_response_event') {
            console.log('Agent response:', message.agent_response_event?.text);
          }
        }}
        onError={(error) => {
          console.error('Conversation error:', error);
          toast({
            title: "Error",
            description: "There was an error with the conversation. Please try again.",
          });
        }}
        ref={conversationRef}
      />
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
              <button
                onClick={() => skipTime(-10)}
                className="relative flex items-center justify-center"
              >
                <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                  <span className="text-xs font-medium">10</span>
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

              <button
                onClick={() => skipTime(10)}
                className="relative flex items-center justify-center"
              >
                <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                  <span className="text-xs font-medium">10</span>
                </div>
              </button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleJoinIn}
                disabled={isLoading}
              >
                <Hand size={16} />
                {isRecording ? "Stop" : "Join in!"}
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
    </>
  );
};
