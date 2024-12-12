import React, { useRef, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useRecognizeFile } from '@hooks/useRecognizeFile';
import type { RecognitionResult } from '@hooks/useTranscription';
import { useTranscription } from '@hooks/useTranscription';
import { motion } from 'framer-motion';
import { Mic, StopCircle, Trash2, Upload } from 'lucide-react';

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

export const MainPage: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognizeFile = useRecognizeFile();

  const { getToken, loading: loadingToken, error: authError } = useAuth();

  const handleResult = (data: RecognitionResult) => {
    setTranscript((prev) => `${prev} ${data.text}`);
  };

  const handleError = (msg: string) => {
    console.error('Ошибка распознавания:', msg);
    setError(`Ошибка распознавания: ${msg}`);
  };

  const { isRecording, startTranscription, stopTranscription } = useTranscription({
    onResult: handleResult,
    onError: handleError
  });

  const handleStartRecording = async () => {
    const username = 'daniel@zakiyev.com';
    const password = 'Qw12er34';

    if (!selectedModel) {
      setError('Пожалуйста, выберите модель перед началом записи.');
      return;
    }

    if (!username || !password) {
      setError('Пожалуйста, введите имя пользователя и пароль.');
      return;
    }

    const token = await getToken(username, password);
    if (!token) {
      return;
    }

    startTranscription({
      config: {
        model: selectedModel,
        file_name: 'session.wav',
        enable_automatic_punctuation: true,
        sil_after_word_timeout_ms: 150,
        sample_rate: 16000
      },
      token
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadedFileName(file.name);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const byteArray = Array.from(uint8Array);

        const response = await recognizeFile.mutateAsync({
          file: byteArray,
          model: selectedModel,
          filename: file.name
        });

        setTranscript(`Распознанный текст из файла ${file.name}: ${response.transcript}`);
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Ошибка загрузки файла.');
      } finally {
        setIsUploading(false);
      }
    }
  };

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
          <div className='flex flex-col space-y-2'>
            <label htmlFor='model-select' className='text-sm font-medium text-foreground'>
              Выберите модель:
            </label>
            <Select onValueChange={setSelectedModel}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Выберите модель' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='kk_telephony_16000'>kk_telephony_16000</SelectItem>
                <SelectItem value='ru_telephony_16000'>ru_telephony_16000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {authError && <div className='text-red-500 text-sm'>{authError}</div>}
          {error && <div className='text-red-500 text-sm'>{error}</div>}

          <div className='flex justify-center space-x-4'>
            <Button
              onClick={isRecording ? stopTranscription : handleStartRecording}
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
              variant='default'
              size='icon'
              className='w-12 h-12 rounded-full bg-blue-600 text-white'
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

          {isUploading && (
            <div className='flex flex-col gap-2'>
              <div className='text-sm font-medium text-gray-500 text-center'>
                {isRecording ? 'Запись...' : 'Загрузка...'}
              </div>
              <div className='w-full h-1 bg-gray-700 rounded-full overflow-hidden'>
                <div
                  className={`h-full bg-blue-600 transition-all duration-300 ${
                    isUploading ? 'animate-pulse w-full' : `w-1%`
                  }`}
                />
              </div>
            </div>
          )}

          {uploadedFileName && (
            <div className='text-sm text-gray-500 text-center'>
              Загруженный файл: {uploadedFileName}
            </div>
          )}

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
