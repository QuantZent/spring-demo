import {
  ErrorBoundary as ReactErrorBoundary,
  type FallbackProps,
} from "react-error-boundary";
import {
  type ErrorInfo as ReactErrorInfo,
  type ErrorInfo,
  type FC,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { logError } from "../../services/logger/logger";
import { ErrorHandlerContext } from "../../context/ErrorHandlerContext";
import {
  Alert,
  Box,
  Button,
  Code,
  Group,
  Modal,
  Notification,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconAlertCircle, IconX } from "@tabler/icons-react";

const ErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error Details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

interface ErrorHandlerProps {
  children: ReactNode;
  fallback?: FC<FallbackProps>;
}

const ErrorHandlerProvider: FC<ErrorHandlerProps> = ({
  children,
  fallback: CustomFallback = ErrorFallback,
}) => {
  const [currentError, setCurrentError] = useState<Error | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const theme = useMantineTheme();
  const colorScheme = useMantineColorScheme();

  const isDevelopment = import.meta.env.MODE === "development";

  const handleError = useCallback(
    (error: Error, info?: Omit<ErrorInfo, "timestamp">) => {
      const errorInfo: ErrorInfo = {
        ...info,
      };

      logError("Error handled:", error, errorInfo);
      setCurrentError(error);
      setErrorDetails(info);
    },
    [],
  );

  const clearError = useCallback(() => {
    setCurrentError(null);
    setErrorDetails(null);
  }, []);

  const logErrorToService = (error: Error, info: ReactErrorInfo) => {
    handleError(error, {
      componentStack: info.componentStack || "No stack available",
    });
  };

  return (
    <ErrorHandlerContext.Provider
      value={{ handleError, clearError, currentError }}
    >
      <ReactErrorBoundary
        FallbackComponent={CustomFallback}
        onError={logErrorToService}
        onReset={clearError}
      >
        {children}
      </ReactErrorBoundary>

      {/* Development Mode - Full Modal */}
      {isDevelopment && (
        <Modal
          opened={!!currentError}
          onClose={clearError}
          title={
            <Text size="lg" w={600}>
              Application Error
            </Text>
          }
          size="lg"
          centered
          overlayProps={{
            color:
              colorScheme.colorScheme === "dark"
                ? theme.colors.dark[9]
                : theme.colors.gray[2],
            opacity: 0.55,
            blur: 3,
          }}
        >
          <Box>
            <Alert
              icon={<IconAlertCircle size="1.5rem" />}
              title="Something went wrong"
              color="red"
              mb="md"
              variant="filled"
            >
              {currentError?.message || "An unexpected error occurred."}
            </Alert>

            {errorDetails && (
              <>
                <Text size="sm" w={500} mb="xs">
                  Error Details:
                </Text>
                <Code
                  block
                  color="red"
                  style={{ overflow: "auto", maxHeight: "200px" }}
                >
                  {typeof errorDetails === "string"
                    ? errorDetails
                    : JSON.stringify(errorDetails, null, 2)}
                </Code>
              </>
            )}

            <Group align="right" mt="xl">
              <Button
                onClick={clearError}
                leftSection={<IconX size="1rem" />}
                variant="light"
              >
                Dismiss
              </Button>
            </Group>
          </Box>
        </Modal>
      )}

      {/* Production Mode - Non-intrusive Notification */}
      {!isDevelopment && currentError && (
        <Notification
          icon={<IconAlertCircle size="1rem" />}
          color="red"
          title="Error Occurred"
          onClose={clearError}
          withCloseButton
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 1000,
            maxWidth: "350px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Text size="sm">
            {currentError.message ||
              "An unexpected error occurred. Please check the console for details."}
          </Text>
        </Notification>
      )}
    </ErrorHandlerContext.Provider>
  );
};

export default ErrorHandlerProvider;
