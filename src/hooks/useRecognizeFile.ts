import { recognizeFile } from '@api/queries/recognize';
import { useMutation } from '@tanstack/react-query';

/**
 * Хук для создания клуба
 * @returns Объект запроса на создание
 */

export const useRecognizeFile = () => {
  const recognizeMutation = useMutation({
    mutationFn: (values: Parameters<typeof recognizeFile>[0]) => recognizeFile(values),
    onSuccess: (res) => {
      console.log(res);
    }
  });

  return recognizeMutation;
};
