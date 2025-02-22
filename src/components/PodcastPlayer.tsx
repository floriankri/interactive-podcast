import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askQuestion } from '@/api/mistral';
import { transcribeAudio } from '@/api/whisper';
import { Mic, MicOff } from 'lucide-react';
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
            setQuestion(transcribedText);
            const answer = await askQuestion(transcribedText, transcript);
            setAnswer(answer);
            await playAnswerAudio(answer);
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
          setAnswer('Sorry, there was an error processing your voice input.');
        }
        setIsLoading(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setAnswer('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const answer = await askQuestion(question, transcript);
      setAnswer(answer);
      await playAnswerAudio(answer);
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Sorry, there was an error processing your question.');
    }
    setIsLoading(false);
  };

  const playAnswerAudio = async (text: string) => {
    try {
      setIsLoading(true);
      const audioData = await textToSpeech(text);
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Audio Player */}
      <div className="rounded-2xl bg-[#202020] overflow-hidden">
        <audio 
          ref={audioRef}
          src={audioSrc}
          controls
          className="w-full"
        />
      </div>

      {/* Question Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Ask a question about the podcast..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full bg-[#202020] border-none rounded-full py-6 px-6 text-gray-300 placeholder:text-gray-500"
        />
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          onClick={isRecording ? stopRecording : startRecording}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
      </div>

      {/* Ask Button */}
      <Button
        onClick={handleAskQuestion}
        disabled={isLoading || !question.trim()}
        className="w-full bg-[#303030] hover:bg-[#404040] text-gray-200 rounded-full py-6 text-lg"
      >
        Ask Question
      </Button>

      {/* Answer Section */}
      {answer && (
        <div className="mt-8 bg-[#202020] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-gray-200">Answer</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAnswerAudio(answer)}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-200"
            >
              🔊 Play
            </Button>
          </div>
          <p className="text-gray-400 leading-relaxed">{answer}</p>
          <audio
            ref={answerAudioRef}
            onEnded={() => setIsPlayingAnswer(false)}
            onPause={() => setIsPlayingAnswer(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}; 