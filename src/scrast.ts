import ffmpeg from "./ffmpeg";
import screen from "./screen";

import { StoreEmitter } from "./store";
import { parseArgs } from "./args";

const main = async () => {
  const args = await parseArgs();

  StoreEmitter.on("store_update", screen.update);

  ffmpeg.run(args);
  ffmpeg.onClose(screen.end);

  process.on("uncaughtException", handleUncaughtException);
};

const handleUncaughtException = (error: Error) => {
  screen.printError(error.message);
  process.exit(1);
};

export { main };
