// // src/App.js или соответствующий файл вашего компонента

// 'use client';

// import React, { useCallback, useRef, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Mic, MicOff, Trash2 } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Textarea } from '@/components/ui/textarea';

// // Импорт сгенерированных gRPC файлов
// import { RecognitionServiceClient } from './grpc/recognition_grpc_web_pb';
// import { RecognitionConfig, StreamingRecognitionRequest } from './grpc/recognition_pb';

// export const MainPage = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [progress, setProgress] = useState(0);
//   const timerRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recognitionClientRef = useRef(null);
//   const streamRef = useRef(null);

//   const stopRecording = useCallback(() => {
//     setIsRecording(false);
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//     }
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//     }
//     if (recognitionClientRef.current) {
//       recognitionClientRef.current.close(); // Закрыть gRPC поток
//     }
//   }, []);

//   const startRecording = useCallback(async () => {
//     setIsRecording(true);
//     setTranscript('');
//     setProgress(0);

//     // Настройка прогресс-бара
//     timerRef.current = setInterval(() => {
//       setProgress((prevProgress) => {
//         if (prevProgress >= 100) {
//           stopRecording();
//           return 100;
//         }
//         return prevProgress + 1;
//       });
//     }, 100);

//     // Запрос доступа к микрофону
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;
//       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=pcm' });

//       // Инициализация gRPC клиента
//       recognitionClientRef.current = new RecognitionServiceClient(
//         'http://localhost:8080',
//         null,
//         null
//       );

//       const config = new RecognitionConfig();
//       config.setModel('your_model_name'); // Укажите вашу модель
//       config.setFileName('audio_stream.webm'); // Имя файла (можно динамически генерировать)
//       config.setEnableAutomaticPunctuation(false); // Временно не поддерживается
//       config.setSilAfterWordTimeoutMs(1000);
//       config.setSampleRate(16000); // Замените на вашу частоту дискретизации
//       config.setEnableAnswerphoneDetection(true);
//       config.setEnableSentimentsDetection(true);
//       config.setEnableAgeIdentification(true);
//       // Настройте остальные параметры по необходимости

//       const request = new StreamingRecognitionRequest();
//       request.setConfig(config);
//       request.setOnlyNew(true);

//       // Начало стрима
//       const stream = recognitionClientRef.current.streamingRecognize();

//       stream.on('data', (response) => {
//         if (response.getText()) {
//           setTranscript((prev) => `${prev} ${response.getText()}`);
//         }
//         // Обработка других полей ответа при необходимости
//       });

//       stream.on('error', (err) => {
//         console.error('gRPC Stream Error:', err);
//         stopRecording();
//       });

//       stream.on('end', () => {
//         console.log('gRPC Stream Ended');
//         stopRecording();
//       });

//       // Отправка начального запроса с конфигурацией
//       stream.write(request);

//       // Обработка аудио данных
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           const reader = new FileReader();
//           reader.onload = () => {
//             const arrayBuffer = reader.result;
//             const uint8Array = new Uint8Array(arrayBuffer);
//             const audioBytes = uint8Array.buffer;
//             const audioContent = new Uint8Array(audioBytes);

//             const audioRequest = new StreamingRecognitionRequest();
//             audioRequest.setAudioContent(audioContent);
//             // Установите only_new по необходимости
//             audioRequest.setOnlyNew(true);

//             stream.write(audioRequest);
//           };
//           reader.readAsArrayBuffer(event.data);
//         }
//       };

//       mediaRecorderRef.current.start(250); // Отправлять каждые 250ms
//     } catch (err) {
//       console.error('Ошибка доступа к микрофону:', err);
//       stopRecording();
//     }
//   }, [stopRecording]);

//   const clearTranscript = () => {
//     setTranscript('');
//   };

//   return (
//     <div className='min-h-screen bg-background flex items-center justify-center p-4'>
//       <Card className='w-full max-w-2xl border-border'>
//         <CardHeader className='border-b border-border'>
//           <CardTitle className='text-xl font-semibold text-foreground'>
//             Распознавание голоса
//           </CardTitle>
//         </CardHeader>
//         <CardContent className='p-6 space-y-6'>
//           <div className='flex justify-center space-x-4'>
//             <Button
//               onClick={isRecording ? stopRecording : startRecording}
//               variant={isRecording ? 'destructive' : 'default'}
//               size='icon'
//               className='w-12 h-12 rounded-full'
//             >
//               <motion.div
//                 animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
//                 transition={{ repeat: Infinity, duration: 1 }}
//               >
//                 {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
//               </motion.div>
//             </Button>
//             <Button
//               onClick={clearTranscript}
//               variant='outline'
//               size='icon'
//               className='w-12 h-12 rounded-full'
//             >
//               <Trash2 size={20} />
//             </Button>
//           </div>
//           {isRecording && (
//             <div className='space-y-2'>
//               <div className='text-sm font-medium text-center text-muted-foreground'>Запись...</div>
//               <Progress value={progress} className='w-full h-1' />
//             </div>
//           )}
//           <Textarea
//             placeholder='Здесь появится распознанный текст...'
//             value={transcript}
//             readOnly
//             className='h-40 resize-none bg-muted text-foreground placeholder-muted-foreground'
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
