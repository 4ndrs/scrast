import { getStore } from "./store";

import type { Status } from "./types";

const CLEARLINE = "\r\u001b[K";
const ENDCOLOR = "\u001b[0m";

const COLORS = Object.freeze({
  RED: "\u001b[1;31m",
  YELLOW: "\u001b[1;33m",
  WHITE: "\u001b[1;37m",
});

const update = () => {
  const { status, seconds, size } = getStore();
  const coloredStatus = getColoredStatus(status);

  process.stdout.write(
    `${CLEARLINE}` +
      `Status: ${coloredStatus}, ` +
      `Elapsed: ${COLORS.WHITE}${seconds} seconds${ENDCOLOR}, ` +
      `size: ${COLORS.WHITE}${size} kB${ENDCOLOR}`
  );
};

const end = () => {
  process.stdout.write("\n");
};

const getColoredStatus = (status: Status) => {
  switch (status) {
    case "recording":
      return `${COLORS.RED}recording${ENDCOLOR}`;
    case "paused":
      return `${COLORS.YELLOW}paused${ENDCOLOR}`;
    case "stopped":
      return `${COLORS.WHITE}stopped${ENDCOLOR}`;
    default:
      assertNever(status);
  }
};

const assertNever = (value: never) => {
  throw new Error(`Unhanlded case: ${value}`);
};

export default { update, end };
