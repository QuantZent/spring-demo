import { createContext } from "react";
import type { ErrorHandlerContextType } from "../types/types";

export const ErrorHandlerContext = createContext<
  ErrorHandlerContextType | undefined
>(undefined);
