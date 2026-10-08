export const APP_TIMEZONE = "Asia/Kolkata";

export const MISSED_GRACE_MINUTES = 120;

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getDateInTimeZone(
  date: Date = new Date(),
  timeZone: string = APP_TIMEZONE
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year =
    parts.find((part) => part.type === "year")?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function getWeekdayInTimeZone(
  date: Date = new Date(),
  timeZone: string = APP_TIMEZONE
) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  return WEEKDAY_MAP[weekday];
}

export function createScheduledTimestamp(
  date: string,
  doseTime: string
) {
  const [hour = "00", minute = "00"] = doseTime.split(":");

  return new Date(
    `${date}T${hour.padStart(2, "0")}:${minute.padStart(
      2,
      "0"
    )}:00+05:30`
  ).toISOString();
}

export function getDayBounds(date: string) {
  return {
    start: new Date(
      `${date}T00:00:00+05:30`
    ).toISOString(),

    end: new Date(
      `${date}T23:59:59.999+05:30`
    ).toISOString(),
  };
}

export function formatDoseTime(time: string) {
  const [hourString = "0", minuteString = "00"] =
    time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  const period = hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${String(minute).padStart(
    2,
    "0"
  )} ${period}`;
}

export function addMinutes(
  isoTimestamp: string,
  minutes: number
) {
  const date = new Date(isoTimestamp);

  date.setMinutes(date.getMinutes() + minutes);

  return date;
}

export function isDoseOverdue(
  scheduledFor: string,
  now: Date = new Date(),
  graceMinutes: number = MISSED_GRACE_MINUTES
) {
  const missedAfter = addMinutes(
    scheduledFor,
    graceMinutes
  );

  return now.getTime() > missedAfter.getTime();
}

export function getDoseTimingState(
  scheduledFor: string,
  status: string,
  now: Date = new Date()
) {
  if (status === "taken") {
    return "taken";
  }

  if (status === "skipped") {
    return "skipped";
  }

  if (status === "missed") {
    return "missed";
  }

  if (isDoseOverdue(scheduledFor, now)) {
    return "missed";
  }

  if (
    new Date(scheduledFor).getTime() >
    now.getTime()
  ) {
    return "upcoming";
  }

  return "due";
}