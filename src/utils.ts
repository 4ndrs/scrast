import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";

/**
 * Returns the seconds with 3 decimal places
 * timestamp format HH:MM:SS
 */
const getSeconds = (timestamp: string) =>
  parseFloat(
    timestamp
      .split(":")
      .reverse()
      .map((num, index) => Number(num) * 60 ** index)
      .reduce((total, current) => total + current, 0)
      .toFixed(3)
  );

/**
 * Returns a string with bytes converted to human
 * readable sizes: bytes, KiB, MiB, GiB
 */
const getHumanSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  if (bytes < 1.049e6) {
    return `${bytes / 1024} KiB`;
  }

  if (bytes < 1.074e9) {
    return `${(bytes / 1.049e6).toFixed(2)} MiB`;
  }

  return `${(bytes / 1.074e9).toFixed(2)} GiB`;
};

/**
 * Generates a filename with unix timestamp in the scrast directory
 * creates the directory if it doesn't exist
 */
const generateOutputFilename = () => {
  const scrastDir = `${homedir}/Videos/scrast`;

  if (!existsSync(scrastDir)) {
    mkdirSync(scrastDir, { recursive: true });
  }

  return `${scrastDir}/${Date.now()}.mkv`;
};

export { getSeconds, getHumanSize, generateOutputFilename };
