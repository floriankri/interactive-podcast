import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Hand } from "lucide-react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { askQuestion } from '@/api/mistral';
import { transcribeAudio } from '@/api/whisper';
import { textToSpeech } from '@/api/elevenlabs';

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

  // API-related state
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const answerAudioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);

  // Add transcript state
  const [transcript, setTranscript] = useState('');

  // Load transcript on mount
  useEffect(() => {
    fetch('/vercel_acq2_transcript.txt')
      .then(response => response.text())
      .then(text => setTranscript(text))
      .catch(error => console.error('Error loading transcript:', error));
  }, []);

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

  // Add voice Q&A functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsLoading(true);
        try {
          const transcribedText = await transcribeAudio(audioBlob);
          if (transcribedText && transcribedText.trim()) {
            const answer = await askQuestion(transcribedText, transcript);
            if (answer) {
              const audioData = await textToSpeech(answer);
              if (answerAudioRef.current && audioData) {
                const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
                answerAudioRef.current.src = URL.createObjectURL(audioBlob);
                setIsPlayingAnswer(true);
                answerAudioRef.current.play();
              }
            }
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
          toast({
            title: "Error",
            description: "There was an error processing your question. Please try again.",
          });
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }
        setIsLoading(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Pause podcast playback while recording
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Update the Join In button handler
  const handleJoinIn = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Add handler for when answer finishes playing
  const handleAnswerFinished = () => {
    setIsPlayingAnswer(false);
    // Resume podcast playback
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 animate-slideUp">
      <audio ref={audioRef} src={audioUrl} />
      <audio
        ref={answerAudioRef}
        className="hidden"
        onEnded={handleAnswerFinished}
        onPause={handleAnswerFinished}
      />
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
  );
};
