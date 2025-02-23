import { useEffect, useState, useRef } from "react";

interface Segment {
  text: string;
  startTime: number;
  endTime: number;
  speaker: string;
}

interface AnimatingSegment {
  text: string;
  startTime: number;
  animationStartTime: number;
}

interface TranscriptDisplayProps {
  currentTime: number;
  onWordUpdate: (word: string) => void;
  onSpeakerUpdate: (speaker: string) => void;
  onSpeakersUpdate: (speakers: Set<string>) => void;
  isVisible: boolean;
  onTranscriptUpdate: (transcript: string) => void;
  onFullTranscriptUpdate: (transcript: string) => void;
}

// Common 5-letter English words
const FIVE_LETTER_WORDS = [
  "about", "above", "after", "again", "alone", "apple", "beach", "begin", "black", "bring",
  "brown", "child", "clean", "clear", "close", "count", "dance", "dream", "drink", "drive",
  "early", "earth", "every", "fight", "first", "floor", "found", "fresh", "front", "ghost",
  "grass", "green", "happy", "heart", "horse", "house", "learn", "light", "lunch", "magic",
  "money", "month", "mouth", "music", "night", "noise", "north", "ocean", "paper", "party",
  "peace", "phone", "plant", "point", "power", "queen", "quiet", "radio", "ready", "right",
  "river", "round", "scene", "share", "sharp", "sheep", "shine", "shore", "smile", "smoke",
  "snake", "space", "speak", "sport", "stack", "stage", "stand", "start", "state", "steam",
  "steel", "stick", "still", "stone", "store", "story", "sweet", "table", "taste", "teach",
  "thank", "theme", "there", "thing", "think", "three", "throw", "tiger", "title", "today",
  "touch", "trade", "train", "treat", "trust", "under", "value", "voice", "watch", "water",
  "wheel", "where", "which", "while", "white", "world", "write", "young"
];

export const TranscriptDisplay = ({ 
  currentTime, 
  onWordUpdate, 
  onSpeakerUpdate, 
  onSpeakersUpdate, 
  isVisible,
  onTranscriptUpdate,
  onFullTranscriptUpdate 
}: TranscriptDisplayProps) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<string>("");
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("");
  const [uniqueSpeakers, setUniqueSpeakers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");
  const [displayedWord, setDisplayedWord] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [randomWord, setRandomWord] = useState<string>("");
  const lastTimeRef = useRef<number>(Math.floor(currentTime));
  const wordAnimationRef = useRef<number | null>(null);
  const currentWordAnimationRef = useRef<AnimatingSegment | null>(null);

  // Constant typing speed regardless of segment length
  const CHARS_PER_SECOND = 20; // Adjust this for faster/slower typing

  const generateRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * FIVE_LETTER_WORDS.length);
    return FIVE_LETTER_WORDS[randomIndex].toUpperCase();
  };

  const animate = (
    timestamp: number,
    animationRef: React.MutableRefObject<AnimatingSegment | null>,
    setDisplayText: (text: string) => void,
    frameRef: React.MutableRefObject<number | null>,
    onWordUpdate: (word: string) => void
  ) => {
    if (!animationRef.current) return;

    const { text, animationStartTime } = animationRef.current;
    const elapsed = timestamp - animationStartTime;
    const charCount = Math.floor(elapsed * (CHARS_PER_SECOND / 1000));
    
    if (charCount < text.length) {
      const displayedText = text.slice(0, charCount);
      setDisplayText(displayedText);
      onWordUpdate(displayedText);
      frameRef.current = requestAnimationFrame((t) => 
        animate(t, animationRef, setDisplayText, frameRef, onWordUpdate)
      );
    } else {
      setDisplayText(text);
      onWordUpdate(text);
      frameRef.current = null;
    }
  };

  const startNewAnimation = (
    text: string,
    animationRef: React.MutableRefObject<AnimatingSegment | null>,
    setDisplayText: (text: string) => void,
    frameRef: React.MutableRefObject<number | null>,
    onWordUpdate: (word: string) => void
  ) => {
    // Cancel any ongoing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Start new animation
    animationRef.current = {
      text,
      startTime: currentTime,
      animationStartTime: performance.now()
    };

    setDisplayText(""); // Clear text before starting new animation
    onWordUpdate(""); // Clear word before starting new animation
    frameRef.current = requestAnimationFrame((t) => 
      animate(t, animationRef, setDisplayText, frameRef, onWordUpdate)
    );
  };

  // Effect for random word generation and animation
  useEffect(() => {
    const currentSecond = Math.floor(currentTime);
    if (currentSecond !== lastTimeRef.current) {
      lastTimeRef.current = currentSecond;
      const newWord = generateRandomWord();
      setRandomWord(newWord);
      startNewAnimation(newWord, currentWordAnimationRef, setDisplayedWord, wordAnimationRef, onWordUpdate);
    }
  }, [currentTime, onWordUpdate]);

  useEffect(() => {
    fetch('/mostlyawesome podcast transcript.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        // Parse the transcript file
        const lines = text.split('\n');
        const parsedSegments: Segment[] = [];
        const speakers = new Set<string>();
        let currentSpeaker = "";
        let formattedTranscript = "";
        
        lines.forEach((line, index) => {
          // First remove any timestamps from the line to avoid false speaker detection
          const lineWithoutTimestamps = line.replace(/\[\d{2}:\d{2}:\d{2}\]/g, '').trim();
          
          // Check for speaker pattern (Name:) after removing timestamps
          const speakerMatch = lineWithoutTimestamps.match(/^([^:]+):/);
          if (speakerMatch) {
            const possibleSpeaker = speakerMatch[1].trim();
            // Verify it's not just a number (to avoid matching timestamps)
            if (!/^\d+$/.test(possibleSpeaker)) {
              currentSpeaker = possibleSpeaker;
              speakers.add(currentSpeaker);
            }
          }

          // Find all timestamps in the original line
          const timeMatches = Array.from(line.matchAll(/\[(\d{2}):(\d{2}):(\d{2})\]/g));
          if (timeMatches.length > 0) {
            // Split the line into segments based on timestamps
            const parts = line.split(/\[\d{2}:\d{2}:\d{2}\]/);
            // Remove the first element if it's empty (when line starts with timestamp)
            if (parts[0].trim() === '') parts.shift();
            
            timeMatches.forEach((match, i) => {
              const hours = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const seconds = parseInt(match[3]);
              const startTime = hours * 3600 + minutes * 60 + seconds;
              const timeString = `[${match[1]}:${match[2]}:${match[3]}]`;
              
              let content = parts[i]?.trim();
              if (content) {
                // Keep the speaker prefix in the content
                // Add to formatted transcript with hidden timestamp for comparison
                formattedTranscript += `<t>${startTime}</t>${content}\n`;
                
                parsedSegments.push({
                  text: content,
                  startTime,
                  endTime: Infinity,  // Will be updated below
                  speaker: currentSpeaker
                });
              }
            });
          }
        });
        
        // Update end times
        parsedSegments.forEach((segment, i) => {
          if (i < parsedSegments.length - 1) {
            segment.endTime = parsedSegments[i + 1].startTime;
          }
        });
        
        setSegments(parsedSegments);
        setUniqueSpeakers(speakers);
        onSpeakersUpdate(speakers);
        onFullTranscriptUpdate(formattedTranscript);
        setError("");
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading transcript:', error);
        setError("Unable to load transcript. Please ensure the transcript file is available.");
        setIsLoading(false);
      });
  }, [onSpeakersUpdate, onFullTranscriptUpdate]);

  useEffect(() => {
    // Find the current segment based on the currentTime
    const current = segments.find(
      segment => currentTime >= segment.startTime && currentTime < segment.endTime
    );
    
    if (current) {
      setCurrentSegment(current.text);
      setCurrentSpeaker(current.speaker);
      onSpeakerUpdate(current.speaker);
      onTranscriptUpdate(current.text);
    }

    return () => {
      if (wordAnimationRef.current) {
        cancelAnimationFrame(wordAnimationRef.current);
        wordAnimationRef.current = null;
      }
    };
  }, [currentTime, segments, onSpeakerUpdate, onTranscriptUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wordAnimationRef.current) {
        cancelAnimationFrame(wordAnimationRef.current);
        wordAnimationRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-destructive/10 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-destructive mb-2">Error</h3>
        <p className="text-base leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl bottom-[180px] top-[300px] p-4 bg-primary/5 rounded-lg shadow-sm overflow-y-auto">
          <h3 className="text-sm font-medium text-primary mb-2">Current Transcript</h3>
          <p className="text-base leading-relaxed text-left">
            {isLoading ? "Loading transcript..." : currentSegment}
          </p>
        </div>
      )}
      {/* Hidden elements that maintain functionality */}
      <div className="hidden">
        <div>
          {isLoading ? "WORLD" : displayedWord}
        </div>
        <div>
          <span>{uniqueSpeakers.size}</span>
          <span>{currentSpeaker || "None"}</span>
        </div>
      </div>
    </div>
  );
};
