// src/hooks/useAuth.ts

import { useCallback, useState } from 'react';
import axios from 'axios';

interface AuthResponse {
  access_token: string;
}

interface UseAuthReturn {
  getToken: (username: string, password: string) => Promise<string | null>;
  loading: boolean;
  error: string;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const getToken = useCallback(
    async (username: string, password: string): Promise<string | null> => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.post<AuthResponse>('http://localhost:3000/auth/login', {
          username,
          password
        });
        return response.data.access_token;
      } catch (err: any) {
        console.error('Error obtaining token:', err.response?.data || err.message);
        setError('Не удалось получить токен. Проверьте ваши учетные данные.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { getToken, loading, error };
}
