import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after client-side hydration — avoids setState-in-effect for this. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
