import { audio$, audioService } from "@/lib/audio";
import { tap } from "rxjs/operators";
import { Routes } from "./Routes";
import { NavigationGuardNext } from "vue-router";

export function redirectOnAudioServiceStateChange$(vue: Vue) {
  return audio$.pipe(
    tap((e) => {
      switch (e.value) {
        case "uninitialized": {
          if (vue.$router.currentRoute.path !== Routes.Home) {
            vue.$router.push({ path: Routes.Home });
          }
          break;
        }
        case "inSetup": {
          vue.$router.push({ path: Routes.Setup });
          break;
        }
        case "running": {
          vue.$router.push({ path: Routes.Listen });
          break;
        }
      }
    })
  );
}

export function redirect(next: NavigationGuardNext<Vue>) {
  if (audioService.state.value === "uninitialized") {
    next({ path: Routes.Home });
  } else next();
}
