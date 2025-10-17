import { useContext } from "react";
import { ErrorHandlerContext } from "../context/ErrorHandlerContext";

export const useErrorHandler = () => {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error("useErrorHandler must be used within ErrorHandler");
  }

  // Return enhanced handler that can show modal
  return (error: Error | string, details?: any) => {
    const errorObj = typeof error === "string" ? new Error(error) : error;
    context.handleError(errorObj, details);
  };
};

export const useErrorContext = () => {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error("useErrorContext must be used within ErrorHandler");
  }
  return context;
};
