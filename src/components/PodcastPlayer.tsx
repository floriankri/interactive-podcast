import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { askQuestion } from '@/api/mistral';
import { transcribeAudio } from '@/api/whisper';
import { Play, Pause, Mic, MicOff } from 'lucide-react';
import { textToSpeech } from '@/api/elevenlabs';

interface PodcastPlayerProps {
  audioSrc: string;
  transcript: string;
}

export const PodcastPlayer = ({ audioSrc, transcript }: PodcastPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);
  const answerAudioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper works well with 16kHz
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000 // 128 kbps for good quality
      });
      
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
          console.log('Audio blob size:', audioBlob.size);
          const transcribedText = await transcribeAudio(audioBlob);
          console.log('Transcribed text:', transcribedText);
          
          if (transcribedText && transcribedText.trim()) {
            setQuestion(transcribedText);
            const answer = await askQuestion(transcribedText, transcript);
            setAnswer(answer);
            // Automatically play the answer
            await playAnswerAudio(answer);
          } else {
            setAnswer('Sorry, I could not transcribe the audio. Please try speaking more clearly and try again.');
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
          setAnswer(`Sorry, there was an error processing your voice input: ${error.message}`);
        }
        setIsLoading(false);
      };

      // Record in smaller chunks
      mediaRecorderRef.current.start(500);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setAnswer('Error accessing microphone. Please make sure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAnswerAudio = async (text: string) => {
    try {
      setIsLoading(true);
      const audioData = await textToSpeech(text);
      
      // Convert ArrayBuffer to Blob
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (answerAudioRef.current) {
        answerAudioRef.current.src = audioUrl;
        answerAudioRef.current.play();
        setIsPlayingAnswer(true);
      }
    } catch (error) {
      console.error('Error playing answer audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const answer = await askQuestion(question, transcript);
      setAnswer(answer);
      // Automatically play the answer
      await playAnswerAudio(answer);
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Sorry, there was an error processing your question.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <audio 
          ref={audioRef} 
          src={audioSrc}
          controls 
          className="w-full"
        />
      </div>

      <form onSubmit={handleAskQuestion} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask a question about the podcast..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant={isRecording ? "destructive" : "secondary"}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Thinking...' : 'Ask Question'}
        </Button>
      </form>

      {answer && (
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Answer:</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAnswerAudio(answer)}
              disabled={isLoading}
            >
              🔊 Play Answer
            </Button>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
          <audio
            ref={answerAudioRef}
            onEnded={() => setIsPlayingAnswer(false)}
            onPause={() => setIsPlayingAnswer(false)}
            className="hidden"
          />
        </div>
      )}
    </Card>
  );
}; 