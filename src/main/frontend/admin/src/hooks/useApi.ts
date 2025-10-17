import { useCallback } from "react";
import api from "../services/config/axiosConfig";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useErrorHandler } from "./useErrorHandler";

export const useApi = () => {
  const handleError = useErrorHandler();

  const request = useCallback(
    async <T>(
      method: "get" | "post" | "put" | "delete",
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      try {
        let response: AxiosResponse<T>;

        switch (method) {
          case "get":
            response = await api.get<T>(url, config);
            break;
          case "post":
            response = await api.post<T>(url, data, config);
            break;
          case "put":
            response = await api.put<T>(url, data, config);
            break;
          case "delete":
            response = await api.delete<T>(url, config);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        return response.data;
      } catch (error) {
        handleError(error as Error, {
          context: `API ${method.toUpperCase()} ${url}`,
          additionalInfo: { url, method, data },
        });
        throw error; // Re-throw so components can still handle if needed
      }
    },
    [handleError],
  );

  const get = useCallback(
    <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      request<T>("get", url, undefined, config),
    [request],
  );

  const post = useCallback(
    <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      request<T>("post", url, data, config),
    [request],
  );

  const put = useCallback(
    <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
      request<T>("put", url, data, config),
    [request],
  );

  const del = useCallback(
    <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
      request<T>("delete", url, undefined, config),
    [request],
  );

  return { get, post, put, delete: del };
};
