const longDateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const longDateWithYearFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDayMonthFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
});

const shortMonthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
});

const shortDayFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
});

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isTodayDate(date: Date) {
  const today = startOfDay(new Date());
  return startOfDay(date).getTime() === today.getTime();
}

export function isTomorrowDate(date: Date) {
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(date).getTime() === tomorrow.getTime();
}

export function isPastDate(date: Date) {
  return date.getTime() < Date.now();
}

export function formatLongSpanishDate(date: Date) {
  return longDateFormatter.format(date);
}

export function formatLongSpanishDateWithYear(date: Date) {
  return longDateWithYearFormatter.format(date);
}

export function formatShortSpanishDayMonth(date: Date) {
  return shortDayMonthFormatter.format(date).replace(".", "");
}

export function formatSpanishMonthShort(date: Date) {
  return shortMonthFormatter.format(date).replace(".", "");
}

export function formatSpanishDayNumber(date: Date) {
  return shortDayFormatter.format(date);
}
