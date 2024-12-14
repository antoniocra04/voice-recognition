import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { floatTo16BitPCM } from '../utils/audioUtils';

interface RecognitionConfig {
  model: string;
  file_name: string;
  enable_automatic_punctuation: boolean;
  sample_rate: number;
}

export interface RecognitionResult {
  text: string;
  chunks: any[];
  final: boolean;
  session_id: string;
}

interface ServerToClientEvents {
  recognitionResult: (data: RecognitionResult) => void;
  recognitionFinished: () => void;
  recognitionError: (msg: string) => void;
}

interface ClientToServerEvents {
  startRecognition: (data: { config: RecognitionConfig; token: string; onlyNew: boolean }) => void;
  audioData: (arrayBuffer: ArrayBuffer) => void;
  stopRecognition: () => void;
}

interface UseTranscriptionOptions {
  onResult: (data: RecognitionResult) => void;
  onError: (msg: string) => void;
}

interface StartTranscriptionParams {
  config: RecognitionConfig;
  token: string;
}

interface UseTranscriptionReturn {
  isRecording: boolean;
  startTranscription: (params: StartTranscriptionParams) => void;
  stopTranscription: () => void;
}

export function useTranscription({
  onResult,
  onError
}: UseTranscriptionOptions): UseTranscriptionReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const isRecordingRef = useRef<boolean>(false); // Реф для отслеживания isRecording

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const stopTranscription = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    if (socketRef.current) {
      socketRef.current.emit('stopRecognition');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsRecording(false);
    isRecordingRef.current = false;
  }, []);

  const startTranscription = useCallback(
    ({ config, token }: StartTranscriptionParams) => {
      if (!config || !token) {
        console.error('Config and token are required to start transcription.');
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream: MediaStream) => {
          mediaStreamRef.current = stream;

          const audioContext = new AudioContext({ sampleRate: 16000 });
          audioContextRef.current = audioContext;

          const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
            'http://localhost:3000',
            {
              transports: ['websocket']
            }
          );
          socketRef.current = socket;

          socket.emit('startRecognition', {
            config,
            token,
            onlyNew: true
          });

          socket.on('recognitionResult', onResult);
          socket.on('recognitionFinished', stopTranscription);
          socket.on('recognitionError', (msg: string) => {
            onError(msg);
            stopTranscription();
          });

          const source: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
          sourceRef.current = source;

          const processor: ScriptProcessorNode = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (event: AudioProcessingEvent) => {
            if (!isRecordingRef.current) return;

            const inputBuffer: Float32Array = event.inputBuffer.getChannelData(0);
            const pcm16: Int16Array = floatTo16BitPCM(inputBuffer);
            const arrayBuffer: ArrayBuffer = pcm16.buffer;

            if (socketRef.current) {
              socketRef.current.emit('audioData', arrayBuffer);
            }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);

          setIsRecording(true);
          isRecordingRef.current = true;
        })
        .catch((err: any) => {
          console.error('Error accessing microphone:', err);
          onError('Ошибка доступа к микрофону.');
        });
    },
    [onResult, onError, stopTranscription]
  );

  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  return { isRecording, startTranscription, stopTranscription };
}
