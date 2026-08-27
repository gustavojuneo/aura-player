import axios from "axios";

import { getSharedRuntime } from "../runtime-config";

export const httpClient = axios.create({
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  config.baseURL ??= getSharedRuntime().apiUrl;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event("aura:session-expired"));
    }
    return Promise.reject(error);
  },
);
