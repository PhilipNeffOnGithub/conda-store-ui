import { format, utcToZonedTime } from "date-fns-tz";
import { Build } from "../../common/models";

const STATUS_OPTIONS: any = {
  COMPLETED: "Available",
  QUEUED: "Queued",
  FAILED: "Failed",
  BUILDING: "Building"
};

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const isBuilding = (status: string) => {
  const BUILD_STATUS = ["BUILDING"];
  return BUILD_STATUS.includes(status);
};

const isQueued = (status: string) => {
  const BUILD_STATUS = ["QUEUED"];
  return BUILD_STATUS.includes(status);
};

const isCompleted = (status: string, duration: number) => {
  if (status === "COMPLETED") {
    if (duration > 0) {
      return `Completed in ${duration} min`;
    }
    return "Completed";
  }
  return STATUS_OPTIONS[status];
};

const dateToTimezone = (date: string) => {
  if (!date) {
    return "";
  }
  const zonedDate = utcToZonedTime(`${date}Z`, TIMEZONE);
  return format(zonedDate, "MMMM do, yyyy - h:mm a", {
    timeZone: TIMEZONE
  });
};

export const buildMapper = (data: Build[], currentBuildId: number) => {
  return data.map(({ id, status, ended_on, scheduled_on }: Build) => {
    let duration = 0;
    if (ended_on && scheduled_on) {
      const startTime = new Date(scheduled_on);
      const endTime = new Date(ended_on);
      duration = (endTime.valueOf() - startTime.valueOf()) / 60000;
      duration = Math.round(duration);
    }
    if (id === currentBuildId) {
      return {
        id,
        name: `${dateToTimezone(ended_on ?? scheduled_on)} - Active`,
        status: isCompleted(status, duration)
      };
    }

    if (isBuilding(status)) {
      return {
        id,
        name: `${dateToTimezone(scheduled_on)} - Building`,
        status: "Building"
      };
    }

    if (isQueued(status)) {
      return {
        id,
        name: `${dateToTimezone(scheduled_on)} - Queued`,
        status: "Building"
      };
    }

    return {
      id,
      name: `${dateToTimezone(ended_on ?? scheduled_on)} - ${
        STATUS_OPTIONS[status]
      }`,
      status: isCompleted(status, duration)
    };
  });
};
