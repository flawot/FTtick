export const format = (raw: number) => {
  const minutes = Math.floor(raw / 60);
  const seconds = raw % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
