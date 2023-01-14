import ffmpeg from "./ffmpeg";
import screen from "./screen";
import ipc from "./ipc";

import { StoreEmitter } from "./store";
import { parseArgs } from "./args";

const main = async () => {
  const args = await parseArgs();

  StoreEmitter.on("store_update", screen.update);

  ffmpeg.run(args);
  ffmpeg.onClose(screen.end);
  ffmpeg.onClose(ipc.kill);

  process.title = "scrast";

  process.on("SIGINT", handleStop);
  process.on("SIGTERM", handleStop);
  process.on("SIGTSTP", handlePause);
  process.on("SIGCONT", handleResume);

  process.on("uncaughtException", handleUncaughtException);
};

const handleStop = () => {
  ffmpeg.kill();
  ipc.kill();
};

const handlePause = () => {
  ffmpeg.pause();
};

const handleResume = () => {
  ffmpeg.resume();
};

const handleUncaughtException = (error: Error) => {
  ffmpeg.kill();
  ipc.kill();

  screen.printError(error.message);
  process.exit(1);
};

export { main };
