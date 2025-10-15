// Centralized logger utility with typed arguments for info, warn, and error levels
// Designed for use in a large-scale React application with TypeScript

export const logInfo = (message: string, ...args: unknown[]): void => {
  console.info(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  // Optional: Add logic to send to an analytics service or custom backend
};

export const logWarn = (message: string, ...args: unknown[]): void => {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  // Optional: Add logic to send to a monitoring service
};

export const logError = (
  message: string,
  error: unknown,
  ...args: unknown[]
): void => {
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${message}`,
    error,
    ...args,
  );
  // Optional: Add logic to send to a custom error tracking backend
};
