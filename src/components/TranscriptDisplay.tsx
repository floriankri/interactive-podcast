
import { useEffect, useState } from "react";

interface Segment {
  text: string;
  startTime: number;
  endTime: number;
}

interface TranscriptDisplayProps {
  currentTime: number;
}

export const TranscriptDisplay = ({ currentTime }: TranscriptDisplayProps) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<string>("");
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
        
        lines.forEach((line, index) => {
          const timeMatch = line.match(/\[(\d{2}):(\d{2})\]/);
          if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            const seconds = parseInt(timeMatch[2]);
            const startTime = minutes * 60 + seconds;
            
            // Get the text content (remove the timestamp)
            const content = line.replace(/\[\d{2}:\d{2}\]/, '').trim();
            
            // Find the end time (next timestamp or end of file)
            let endTime = Infinity;
            for (let j = index + 1; j < lines.length; j++) {
              const nextTimeMatch = lines[j].match(/\[(\d{2}):(\d{2})\]/);
              if (nextTimeMatch) {
                const nextMinutes = parseInt(nextTimeMatch[1]);
                const nextSeconds = parseInt(nextTimeMatch[2]);
                endTime = nextMinutes * 60 + nextSeconds;
                break;
              }
            }
            
            parsedSegments.push({
              text: content,
              startTime,
              endTime
            });
          }
        });
        
        setSegments(parsedSegments);
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
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-primary/5 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-primary mb-2">Current Transcript</h3>
      <p className="text-base leading-relaxed">{currentSegment || "Loading transcript..."}</p>
    </div>
  );
};
