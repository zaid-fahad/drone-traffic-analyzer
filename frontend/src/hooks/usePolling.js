import { useState, useEffect, useCallback } from "react";

function usePolling(callback, interval = 2000, enabled = true) {
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  const poll = useCallback(async () => {
    if (!enabled) return;

    try {
      setError(null);
      await callback();
    } catch (err) {
      setError(err.message || "Polling failed");
      console.error("Polling error:", err);
    }
  }, [callback, enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    poll(); // Initial call

    const intervalId = setInterval(poll, interval);

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [poll, interval, enabled]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    if (enabled) {
      setIsPolling(true);
    }
  }, [enabled]);

  return {
    isPolling,
    error,
    stopPolling,
    startPolling
  };
}

export default usePolling;