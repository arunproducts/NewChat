import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  audioAmplitude: number;
  playAudio: (audioUrl: string) => Promise<void>;
  stopAudio: () => void;
}

export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioAmplitude, setAudioAmplitude] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedAmplitude = average / 255;

    setAudioAmplitude(normalizedAmplitude);

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isPlaying]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    setAudioAmplitude(0);
  }, []);

  const playAudio = useCallback(
    async (audioUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        try {
          // Stop any existing audio
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
          }
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          // Create new audio element
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          // Set up audio context and analyser
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
          }

          const audioContext = audioContextRef.current;
          const source = audioContext.createMediaElementSource(audio);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          source.connect(analyser);
          analyser.connect(audioContext.destination);
          analyserRef.current = analyser;

          audio.onended = () => {
            setIsPlaying(false);
            setAudioAmplitude(0);
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
            resolve();
          };

          audio.onerror = (error) => {
            setIsPlaying(false);
            setAudioAmplitude(0);
            reject(error);
          };

          setIsPlaying(true);
          audio.play().then(() => {
            analyzeAudio();
          }).catch(reject);
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          setAudioAmplitude(0);
          reject(error);
        }
      });
    },
    [analyzeAudio]
  );

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    audioAmplitude,
    playAudio,
    stopAudio,
  };
}
