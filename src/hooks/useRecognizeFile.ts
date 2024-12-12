import { recognizeFile } from '@api/queries/recognize';
import { useMutation } from '@tanstack/react-query';

export const useRecognizeFile = () => {
  const recognizeMutation = useMutation({
    mutationFn: (values: Parameters<typeof recognizeFile>[0]) => recognizeFile(values),
    onSuccess: () => {}
  });

  return recognizeMutation;
};
