export interface ErrorInfo {
  componentStack?: string;
  context?: string;
  timestamp?: Date;
  additionalInfo?: Record<string, unknown>;
}

export interface ErrorHandlerContextType {
  handleError: (error: Error, info?: Omit<ErrorInfo, "timestamp">) => void;
  clearError: () => void;
  currentError: Error | null;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
  title: string;
}

export interface ApiErrorResponse {
    status: string;
  errors: {
    errorCode: string;
    errorMessage: string;
  };
  message: string;
  title: string;
}
