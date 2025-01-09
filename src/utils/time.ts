export function getTimeElapsed(startTime: string | Date): number {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.floor((now - start) / 1000);
}
