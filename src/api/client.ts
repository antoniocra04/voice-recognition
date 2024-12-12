import axios from 'axios';

import { store } from '../store';

export const HOST = 'http://localhost:3000';
export const BACKEND_URL = `${HOST}`;

export const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Access-Control-Allow-Origin': '*' }
});

axiosClient.interceptors.request.use(function (config) {
  config.headers.Authorization = `Bearer CBRdTqKQL4TP1Ovjm5bfeAydzX`;
  return config;
});
