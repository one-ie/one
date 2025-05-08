import { useCallback } from "react";
import { toast } from "sonner";

export const useApiErrorHandler = () => {
  return useCallback((e: any) => {
    console.error("APIError: ", e);
    toast.error(`${e}`);
  }, []);
};
