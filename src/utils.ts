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

export { getSeconds, generateOutputFilename };
