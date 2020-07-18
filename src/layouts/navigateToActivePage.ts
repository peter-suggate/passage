import { AppState, AppService } from "@/appService";
import { pageTop } from "./page-transforms";
import { pageIndexForState } from "./appLayouts";

export const navigateToActivePage = (appService: AppService) => {
  setTimeout(() => {
    window.scroll({
      top: pageTop(pageIndexForState(appService.state as AppState)),
      behavior: "smooth",
    });
  }, 0);
};
