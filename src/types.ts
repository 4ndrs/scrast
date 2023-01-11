export interface Store {
  status: Status;
  seconds: number;
  size: number;
}

export type Status = "recording" | "paused" | "stopped";
