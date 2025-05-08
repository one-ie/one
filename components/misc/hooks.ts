import * as React from "react";
import {
  formatDistanceToNow,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";

/**
 * Hook that returns a dynamically updating relative time string (e.g. "2 minutes ago")
 * Updates more frequently for recent timestamps and less frequently for older ones.
 */
export const useTimeAgo = (timestamp: number) => {
  const [timeAgo, setTimeAgo] = React.useState(() =>
    formatDistanceToNow(new Date(timestamp), { addSuffix: true }),
  );

  React.useEffect(() => {
    const date = new Date(timestamp);

    const getUpdateInterval = () => {
      const secondsOld = differenceInSeconds(new Date(), date);
      const minutesOld = differenceInMinutes(new Date(), date);
      const hoursOld = differenceInHours(new Date(), date);

      if (secondsOld < 60) return 1000; // Update every second
      if (minutesOld < 60) return 60000; // Update every minute
      if (hoursOld < 24) return 300000; // Update every 5 minutes
      return 3600000; // Update every hour for older messages
    };

    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    };

    const interval = setInterval(() => {
      updateTimeAgo();
      // Dynamically adjust the interval
      clearInterval(interval);
      const newInterval = setInterval(updateTimeAgo, getUpdateInterval());
      return () => clearInterval(newInterval);
    }, getUpdateInterval());

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
};
