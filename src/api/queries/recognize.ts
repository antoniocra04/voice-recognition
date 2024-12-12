import { axiosClient } from '@api/client';
import type { ByteSource } from 'google-protobuf';

export const recognizeFile = async (values: {
  file: ByteSource;
  model: string;
  filename: string;
}): Promise<any> => {
  return axiosClient.post(`/recognize`, {
    audioContent: values.file,
    config: {
      enable_automatic_punctuation: false,
      file_name: values.filename,
      model: values.model
    }
  });
};
