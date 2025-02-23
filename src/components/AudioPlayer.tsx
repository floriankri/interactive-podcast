import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Hand, Mic, FileText } from "lucide-react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { ConversationHandler } from "./ConversationHandler";
import { useConversation } from '@11labs/react';
import { useConversationContext } from '@/contexts/ConversationContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Add these type definitions at the top of the file
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message?: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  author: string;
  onTimeUpdate?: (time: number) => void;
  onTranscriptToggle: (isVisible: boolean) => void;
  isTranscriptVisible: boolean;
  currentTranscript: string;
  fullTranscript: string;
  transcriptlocation: string;
  isMainPage?: boolean;
}

export const AudioPlayer = ({ audioUrl, title, author, onTimeUpdate, onTranscriptToggle, isTranscriptVisible, currentTranscript, fullTranscript, transcriptlocation, isMainPage }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollPosition = useRef<number>(0);
  const { toast } = useToast();
  const { agentId } = useConversationContext();
  const conversation = useConversation();

  // API-related state
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const conversationRef = useRef<any>(null);
  const answerAudioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);

  // Add transcript state
  const [transcript, setTranscript] = useState('');

  // Add these near your other state declarations
  const [isInitializing, setIsInitializing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds between retries

  // Update transcript loading to remove fallback
  useEffect(() => {
    fetch(transcriptlocation)
      .then(response => response.text())
      .then(text => setTranscript(text))
      .catch(error => console.error('Error loading transcript:', error));
  }, [transcriptlocation]);

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

  const handleLineClick = (timestamp: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
      // If audio was paused, start playing from the clicked position
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
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
      // Resume podcast audio
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
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
      // Pause podcast audio
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
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

  // Function to handle transcript scroll
  const handleTranscriptScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const currentLine = container.querySelector('[data-current="true"]');
    
    if (currentLine) {
      const containerRect = container.getBoundingClientRect();
      const lineRect = currentLine.getBoundingClientRect();
      const lineCenter = lineRect.top + lineRect.height / 2;
      const containerCenter = containerRect.top + containerRect.height / 2;
      
      // If the current line is roughly in the center area (with some margin)
      const isNearCenter = Math.abs(lineCenter - containerCenter) < containerRect.height / 4;
      
      // Only update autoScroll if the user has actually scrolled
      if (container.scrollTop !== lastScrollPosition.current) {
        setAutoScroll(isNearCenter);
        lastScrollPosition.current = container.scrollTop;
      }
    }
  };

  // Function to scroll current line to center
  const scrollToCurrentLine = () => {
    if (autoScroll && transcriptRef.current) {
      const currentLine = transcriptRef.current.querySelector('[data-current="true"]');
      if (currentLine) {
        const container = transcriptRef.current;
        const containerHeight = container.clientHeight;
        const lineTop = (currentLine as HTMLElement).offsetTop;
        const lineHeight = (currentLine as HTMLElement).offsetHeight;
        
        // Calculate position to center the line
        const scrollPosition = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Call scrollToCurrentLine whenever currentTime changes and autoScroll is true
  useEffect(() => {
    scrollToCurrentLine();
  }, [currentTime, autoScroll]);

  // Call scrollToCurrentLine when transcript becomes visible
  useEffect(() => {
    if (isTranscriptVisible) {
      // Small delay to ensure the DOM is ready
      setTimeout(scrollToCurrentLine, 100);
    }
  }, [isTranscriptVisible]);

  const [isNoteTaking, setIsNoteTaking] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [wasPlayingBeforeNote, setWasPlayingBeforeNote] = useState(false);

  const getCurrentTranscriptSegment = () => {
    console.log('Getting transcript segment at time:', currentTime);
    
    const lines = fullTranscript.split('\n');
    let contextSegments = [];
    let currentIndex = -1;
    
    // First, find the current line index
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const timeMatch = line.match(/<t>(\d+)<\/t>/);
      if (timeMatch) {
        const timestamp = parseInt(timeMatch[1]);
        if (timestamp <= currentTime && (!lines[i + 1] || !lines[i + 1].match(/<t>(\d+)<\/t>/) || parseInt(lines[i + 1].match(/<t>(\d+)<\/t>/)[1]) > currentTime)) {
          currentIndex = i;
          break;
        }
      }
    }

    console.log('Current line index:', currentIndex);

    if (currentIndex === -1) {
      console.log('No current line found');
      return '';
    }

    // Gather context from previous lines (up to 10 lines)
    const startIndex = Math.max(0, currentIndex - 10);
    for (let i = startIndex; i <= currentIndex; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const cleanLine = line.replace(/<t>\d+<\/t>/, '').trim();
      
      // Extract speaker if present
      const speakerMatch = cleanLine.match(/^([A-Za-z]+):/);
      if (speakerMatch) {
        const speaker = speakerMatch[1].trim();
        const content = cleanLine.slice(speakerMatch[0].length).trim();
        contextSegments.push(`${speaker}: ${content}`);
      } else {
        contextSegments.push(cleanLine);
      }
    }

    const contextText = contextSegments.join('\n');
    console.log('Context segments:', contextSegments);
    return contextText;
  };

  const startNoteTaking = async () => {
    try {
      // Pause podcast if playing
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setWasPlayingBeforeNote(true);
      }

      // Get the current transcript segment
      const currentSegment = getCurrentTranscriptSegment();
      
      // Add the current segment to notes
      setNoteText(prev => {
        const timestamp = formatTime(currentTime);
        const newNote = `[${timestamp}] ${currentSegment}\n\n`;
        return prev + newNote;
      });

      setIsNoteTaking(true);
      
      toast({
        title: "Note Added",
        description: "Current segment has been added to your notes.",
      });

    } catch (error) {
      console.error('Error taking note:', error);
      toast({
        title: "Error",
        description: "Could not add note. Please try again.",
      });
    }
  };

  const stopNoteTaking = () => {
    setIsNoteTaking(false);
    
    // Resume playback if it was playing before
    if (wasPlayingBeforeNote && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    setWasPlayingBeforeNote(false);
  };

  const handleNoteClick = () => {
    if (isNoteTaking) {
      stopNoteTaking();
    } else {
      startNoteTaking();
    }
  };

  // Add this function near other handler functions
  const handleAnswerFinished = () => {
    setIsPlayingAnswer(false);
  };

  const betaMessage = "This feature is not available for this podcast yet (Beta)";

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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={!isMainPage ? "cursor-not-allowed" : ""}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleJoinIn}
                        disabled={isLoading || !isMainPage}
                        data-disabled={!isMainPage}
                      >
                        <Hand size={16} />
                        {isRecording ? "Stop" : "Join in!"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isMainPage && (
                    <TooltipContent side="top" className="bg-black text-white p-2 rounded-lg">
                      <p className="text-sm">{betaMessage}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
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

      <div className="fixed bottom-0 left-0 right-0 glass-morphism p-4 z-[999]">
        <audio ref={audioRef} src={audioUrl} />
        <audio
          ref={answerAudioRef}
          className="hidden"
          onEnded={handleAnswerFinished}
          onPause={handleAnswerFinished}
        />
        <div className="container mx-auto max-w-4xl relative">
          {isTranscriptVisible && (
            <>
              <div 
                ref={transcriptRef}
                onScroll={handleTranscriptScroll}
                className="absolute left-0 w-[48%] -top-[300px] p-4 bg-background/80 backdrop-blur-[8px] rounded-lg overflow-y-auto h-[250px]"
              >
                <h3 className="text-sm font-medium text-primary mb-2">Transcript</h3>
                <div className="text-sm leading-relaxed text-left whitespace-pre-wrap">
                  {fullTranscript.split('\n').map((line, index, array) => {
                    if (!line.trim()) return null;
                    const timeMatch = line.match(/<t>(\d+)<\/t>/);
                    const timestamp = timeMatch ? parseInt(timeMatch[1]) : 0;
                    const text = line.replace(/<t>\d+<\/t>/, '').trim();
                    
                    // Extract speaker name if present (format: "Speaker:")
                    const speakerMatch = text.match(/^([A-Za-z]+):/);
                    const speaker = speakerMatch ? speakerMatch[1].trim() : '';
                    const content = speakerMatch ? text.slice(speakerMatch[0].length).trim() : text;
                    
                    // Check if speaker changed from previous non-empty line
                    let previousSpeaker = '';
                    for (let i = index - 1; i >= 0; i--) {
                      const prevLine = array[i];
                      if (prevLine && prevLine.trim()) {
                        const prevText = prevLine.replace(/<t>\d+<\/t>/, '').trim();
                        const prevSpeakerMatch = prevText.match(/^([A-Za-z]+):/);
                        if (prevSpeakerMatch) {
                          previousSpeaker = prevSpeakerMatch[1].trim();
                          break;
                        }
                      }
                    }
                    
                    const showSpeaker = speaker && speaker !== previousSpeaker;
                    const isCurrent = timestamp <= currentTime && (!array[index + 1]?.match(/<t>(\d+)<\/t>/) || parseInt(array[index + 1].match(/<t>(\d+)<\/t>/)[1]) > currentTime);
                    
                    return (
                      <div key={index}>
                        {showSpeaker && (
                          <div 
                            className={`font-medium mt-4 mb-2 ${timestamp <= currentTime ? "text-foreground" : "text-muted-foreground"} cursor-pointer hover:text-primary transition-colors`}
                            onClick={() => handleLineClick(timestamp)}
                          >
                            {speaker}
                          </div>
                        )}
                        <div 
                          data-current={isCurrent}
                          className={`${timestamp <= currentTime ? "text-foreground" : "text-muted-foreground"} ${isCurrent ? "bg-primary/5" : ""} pl-4 cursor-pointer hover:text-primary transition-colors`}
                          onClick={() => handleLineClick(timestamp)}
                        >
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div 
                className="absolute right-0 w-[48%] -top-[300px] p-4 bg-background/80 backdrop-blur-[8px] rounded-lg overflow-hidden h-[250px]"
              >
                <div className="h-full overflow-y-auto">
                  <h3 className="text-sm font-medium text-primary mb-2">Notes</h3>
                  <div className="text-sm leading-relaxed text-left whitespace-pre-wrap pb-16">
                    {noteText}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNoteClick}
                  >
                    {isNoteTaking ? "Stop" : "Note"}
                  </Button>
                </div>
              </div>
            </>
          )}
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

            {/* Play and Skip Buttons - Center */}
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
            </div>

            {/* Join in Button and Transcript Button - Right */}
            <div className="flex justify-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={!isMainPage ? "cursor-not-allowed" : ""}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleJoinIn}
                        disabled={isLoading || !isMainPage}
                        data-disabled={!isMainPage}
                      >
                        <Hand size={16} />
                        {isRecording ? "Stop" : "Join in!"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isMainPage && (
                    <TooltipContent side="top" className="bg-black text-white p-2 rounded-lg">
                      <p className="text-sm">{betaMessage}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={!isMainPage ? "cursor-not-allowed" : ""}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => onTranscriptToggle(!isTranscriptVisible)}
                        disabled={!isMainPage}
                        data-disabled={!isMainPage}
                      >
                        <FileText size={16} />
                        Transcript
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isMainPage && (
                    <TooltipContent side="top" className="bg-black text-white p-2 rounded-lg">
                      <p className="text-sm">{betaMessage}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
