// src/MainPage.jsx

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mic, StopCircle, Trash2, Upload } from 'lucide-react';
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRecognizeFile } from '@/hooks/useRecognizeFile';

function floatTo16BitPCM(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    output[i] = s;
  }
  return output;
}

export const MainPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognizeFile = useRecognizeFile();
  const [progress, setProgress] = useState();
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const audioContextRef = useRef(null);

  // Функция для получения токена
  const getToken = async (username, password) => {
    setLoadingToken(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/auth/login', { username, password });

      return response.data.access_token;
    } catch (err) {
      console.error('Error obtaining token:', err.response?.data || err.message);
      setError('Не удалось получить токен. Проверьте ваши учетные данные.');
      return null;
    } finally {
      setLoadingToken(false);
    }
  };

  const startRecording = async () => {
    const username = 'antoniocra04@gmail.com';
    const password = 'gonrag-kavXux-mohcu3';

    if (!selectedModel) {
      setError('Пожалуйста, выберите модель перед началом записи.');
      return;
    }

    if (!username || !password) {
      setError('Пожалуйста, введите имя пользователя и пароль.');
      return;
    }

    const token = await getToken(username, password);
    if (!token) return;

    // Инициализируем socket
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    // Создаём AudioContext без указания sampleRate
    const audioContext = new AudioContext({ sampleRate: 16000 }); // Использует частоту дискретизации по умолчанию, например, 48000 Гц
    audioContextRef.current = audioContext;

    socket.emit('startRecognition', {
      config: {
        model: selectedModel,
        file_name: 'session.wav',
        enable_automatic_punctuation: true,
        sil_after_word_timeout_ms: 150,
        sample_rate: 16000 // Частота, ожидаемая моделью после ресэмплинга на бэкенде
      },
      token,
      onlyNew: true
    });

    // Обработка полученного текста
    socket.on('recognitionResult', (data) => {
      console.log(data);
      setTranscript((prev) => `${prev} ${data.text}`);
    });

    // Обработка завершения распознавания
    socket.on('recognitionFinished', () => {
      setIsRecording(false);
    });

    // Обработка ошибок
    socket.on('recognitionError', (msg) => {
      console.error('Ошибка распознавания:', msg);
      setError(`Ошибка распознавания: ${msg}`);
      setIsRecording(false);
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Создаём ScriptProcessorNode с bufferSize = 4096
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputBuffer);

        // Отправляем бинарные данные напрямую
        socket.emit('audioData', pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      setTranscript('');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Ошибка доступа к микрофону.');
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadedFileName(file.name);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const byteArray = Array.from(uint8Array);
      console.log(uploadedFileName);

      recognizeFile.mutate({ file: byteArray, model: selectedModel, filename: file.name });

      setIsUploading(false);
      setTranscript(
        `Распознанный текст из файла ${file.name}: Это пример текста, полученного из загруженного аудиофайла.`
      );
    }
  };

  // Функция для очистки транскрипта
  const clearTranscript = () => {
    setTranscript('');
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl border-border'>
        <CardHeader className='border-b border-border'>
          <CardTitle className='text-xl font-semibold text-foreground'>
            Распознавание голоса
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          {/* Блок выбора модели */}
          <div className='flex flex-col space-y-2'>
            <label htmlFor='model-select' className='text-sm font-medium text-foreground'>
              Выберите модель:
            </label>
            <Select onValueChange={(value) => setSelectedModel(value)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Выберите модель' />
              </SelectTrigger>
              <SelectContent>
                {/* Добавьте ваши модели здесь */}
                <SelectItem value='kk_telephony_16000'>kk_telephony_16000</SelectItem>
                <SelectItem value='ru_telephony_16000'>ru_telephony_16000</SelectItem>
                {/* и т.д. */}
              </SelectContent>
            </Select>
          </div>

          {/* Отображение ошибок */}
          {error && <div className='text-red-500 text-sm'>{error}</div>}

          {/* Кнопки управления записью */}
          <div className='flex justify-center space-x-4'>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant='default'
              size='icon'
              className='w-12 h-12 rounded-full'
              disabled={loadingToken}
            >
              <motion.div transition={{ repeat: Infinity, duration: 1 }}>
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </motion.div>
            </Button>
            <Button
              onClick={triggerFileUpload}
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Upload size={20} />
            </Button>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept='audio/*'
              style={{ display: 'none' }}
            />
            <Button
              onClick={clearTranscript}
              variant='outline'
              size='icon'
              className='w-12 h-12 rounded-full'
            >
              <Trash2 size={20} />
            </Button>
          </div>

          {/* Индикатор записи */}
          {(isRecording || isUploading) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  color: '#71717a'
                }}
              >
                {isRecording ? 'Запись...' : 'Загрузка...'}
              </div>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#27272a',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: isUploading ? '100%' : `${progress}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    transition: 'width 0.3s ease-in-out',
                    animation: isUploading ? 'pulse 1.5s infinite' : 'none'
                  }}
                />
              </div>
            </div>
          )}
          {uploadedFileName && (
            <div
              style={{
                fontSize: '0.875rem',
                color: '#71717a',
                textAlign: 'center'
              }}
            >
              Загруженный файл: {uploadedFileName}
            </div>
          )}
          {/* Текстовая область для транскрипта */}
          <Textarea
            value={transcript}
            placeholder='Здесь появится распознанный текст...'
            readOnly
            className='h-40 resize-none bg-muted text-foreground placeholder-muted-foreground'
          />
        </CardContent>
      </Card>
    </div>
  );
};
