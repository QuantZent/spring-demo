import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/code-highlight/styles.css";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import { createTheme, MantineProvider } from "@mantine/core";
import ErrorHandlerProvider from "./components/common/ErrorHandlerProvider.tsx";

const mountPoint = document.getElementById("root");

if (!mountPoint) {
  throw new Error('Root element with id="root" not found');
}

const root = createRoot(mountPoint);

const queryClient = new QueryClient();

const theme = createTheme({
  /** Your theme override here */
});

root.render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <ErrorHandlerProvider>
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorHandlerProvider>
    </MantineProvider>
  </StrictMode>,
);
