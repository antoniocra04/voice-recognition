// src/MainPage.jsx

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mic, StopCircle, Trash2 } from 'lucide-react';
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const MainPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
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
    const username = 'daniel@zakiyev.com'; // Замените на имя пользователя
    const password = 'Qw12er34'; // Замените на пароль пользователя
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav', // WAV поддерживает PCM формат
        desiredSampRate: 16000, // 16kHz
        numberOfAudioChannels: 1 // Mono
      });

      recorderRef.current.startRecording();

      // Устанавливаем соединение через Socket.IO
      const socket = io('http://localhost:3000'); // Замените на URL вашего бэкенда
      socketRef.current = socket;

      // Отправляем событие начала распознавания с токеном и моделью
      socket.emit('startRecognition', {
        token,
        model: selectedModel
      });

      // Обработка полученного текста
      socket.on('recognizedText', (data) => {
        setTranscript((prev) => `${prev} ${data.text}`);
      });

      // Обработка завершения распознавания
      socket.on('recognitionEnd', () => {
        setIsRecording(false);
      });

      // Обработка ошибок
      socket.on('error', (data) => {
        console.error('Ошибка распознавания:', data.message);
        setError(`Ошибка распознавания: ${data.message}`);
        setIsRecording(false);
      });

      setIsRecording(true);
      setTranscript('');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Ошибка доступа к микрофону.');
    }
  };

  // Функция для остановки записи
  const stopRecording = async () => {
    try {
      if (recorderRef.current) {
        await recorderRef.current.stopRecording();

        // Получаем Blob с аудиоданными
        const blob = recorderRef.current.getBlob();

        // Читаем Blob как ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();

        // Отправляем аудиоданные на бэкенд
        socketRef.current.emit('audioData', arrayBuffer);
        socketRef.current.emit('stopRecognition');

        // Останавливаем и очищаем медиа потоки
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        recorderRef.current.destroy();
        recorderRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recorder:', err);
      setError('Ошибка остановки записи.');
    }
  };

  // Функция для очистки транскрипта
  const clearTranscript = () => {
    setTranscript('');
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
              onClick={clearTranscript}
              variant='outline'
              size='icon'
              className='w-12 h-12 rounded-full'
            >
              <Trash2 size={20} />
            </Button>
          </div>

          {/* Индикатор записи */}
          {isRecording && (
            <div className='space-y-2'>
              <div className='text-sm font-medium text-center text-muted-foreground'>Запись...</div>
              <Progress className='w-full h-1' />
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
