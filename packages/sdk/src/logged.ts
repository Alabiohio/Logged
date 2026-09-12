import { Logged } from "./logger";

declare global {
  interface Window {
    Logged: typeof import("./logger").Logged;
  }

  var Logged: typeof import("./logger").Logged;
}

if (typeof window !== "undefined") {
  window.Logged = Logged;
}

if (typeof globalThis !== "undefined") {
  (globalThis as typeof globalThis & { Logged: typeof import("./logger").Logged }).Logged = Logged;
}

export { Logged };
export default Logged;
