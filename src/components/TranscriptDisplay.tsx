import { useEffect, useState } from "react";

interface Segment {
  text: string;
  startTime: number;
  endTime: number;
  speaker: string;
}

interface TranscriptDisplayProps {
  currentTime: number;
}

export const TranscriptDisplay = ({ currentTime }: TranscriptDisplayProps) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<string>("");
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("");
  const [uniqueSpeakers, setUniqueSpeakers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");

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
              
              // Get end time from next timestamp, or next line's timestamp
              let endTime = Infinity;
              if (i < timeMatches.length - 1) {
                // If there's another timestamp in this line, use it
                const nextMatch = timeMatches[i + 1];
                const nextHours = parseInt(nextMatch[1]);
                const nextMinutes = parseInt(nextMatch[2]);
                const nextSeconds = parseInt(nextMatch[3]);
                endTime = nextHours * 3600 + nextMinutes * 60 + nextSeconds;
              } else {
                // Otherwise look for timestamp in next lines
                for (let j = index + 1; j < lines.length; j++) {
                  const nextTimeMatch = lines[j].match(/\[(\d{2}):(\d{2}):(\d{2})\]/);
                  if (nextTimeMatch) {
                    const nextHours = parseInt(nextTimeMatch[1]);
                    const nextMinutes = parseInt(nextTimeMatch[2]);
                    const nextSeconds = parseInt(nextTimeMatch[3]);
                    endTime = nextHours * 3600 + nextMinutes * 60 + nextSeconds;
                    break;
                  }
                }
              }
              
              let content = parts[i]?.trim();
              if (content) {
                // Remove speaker prefix from content if it exists
                const contentWithoutSpeaker = content.replace(/^[^:]+:\s*/, '');
                // Only use the cleaned content if we actually removed a speaker prefix
                content = contentWithoutSpeaker !== content ? contentWithoutSpeaker : content;
                
                parsedSegments.push({
                  text: content,
                  startTime,
                  endTime,
                  speaker: currentSpeaker
                });
              }
            });
          }
        });
        
        setSegments(parsedSegments);
        setUniqueSpeakers(speakers);
        setError("");
      })
      .catch(error => {
        console.error('Error loading transcript:', error);
        setError("Unable to load transcript. Please ensure the transcript file is available.");
      });
  }, []);

  useEffect(() => {
    // Find the current segment based on the currentTime
    const current = segments.find(
      segment => currentTime >= segment.startTime && currentTime < segment.endTime
    );
    
    if (current) {
      setCurrentSegment(current.text);
      setCurrentSpeaker(current.speaker);
    }
  }, [currentTime, segments]);

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
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-primary/5 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-primary mb-2">Current Transcript</h3>
        <p className="text-base leading-relaxed">{currentSegment || "Loading transcript..."}</p>
      </div>
      
      <div className="max-w-2xl mx-auto p-4 bg-primary/5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-primary">Speakers: </span>
            <span className="text-base">{uniqueSpeakers.size}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-primary">Current Speaker: </span>
            <span className="text-base">{currentSpeaker || "None"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
