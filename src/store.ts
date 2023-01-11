import EventEmitter from "events";

import type { Store } from "./types";

const initialState: Store = { status: "stopped", seconds: 0, size: 0 };

const store: Store = {
  ...initialState,
};

const StoreEmitter = new EventEmitter();

const getStore = () => ({ ...store });

const setStore = (updater: (currentStore: Store) => Store) => {
  const newStore = updater({ ...store });

  if (isEqual(store, newStore)) {
    return;
  }

  ({
    status: store.status,
    seconds: store.seconds,
    size: store.size,
  } = newStore);

  StoreEmitter.emit("store_update");
};

const isEqual = (currentStore: Store, newStore: Store) =>
  currentStore.size === newStore.size &&
  currentStore.status === newStore.status &&
  currentStore.seconds === newStore.seconds;

export { StoreEmitter, getStore, setStore };
