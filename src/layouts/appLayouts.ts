import { fromEvent } from "rxjs";
import { withLatestFrom, map, startWith } from "rxjs/operators";
import HomeView from "@/views/home/HomeView.vue";
import SetupView from "@/views/setup-audio/SetupView.vue";
import SetupSynthView from "@/views/setup-synth/SetupSynthView.vue";
import SessionView from "@/views/session/SessionView.vue";
import { AppState, App$ } from "@/appService";
import {
  scrollNormal,
  opacityNormal,
  scrollParallax,
  opacityFadeoutAbove,
  PAGE_SIZE_FRAC,
  pageTop,
  pageHeight,
} from "./page-transforms";

export type LayoutViews = {
  Home: typeof HomeView;
  Setup: typeof SetupView;
  SetupSynthView: typeof SetupSynthView;
  Listen: typeof SessionView;
};

export const layoutViews = {
  Home: HomeView,
  Setup: SetupView,
  SetupSynthView,
  Listen: SessionView,
};

export type LayoutConfig = {
  component: keyof LayoutViews;
  transform: (scrollY: number, pageTopY: number, pageHeight: number) => string;
  opacity: (scrollY: number, pageTopY: number, pageHeight: number) => number;
};

const layoutConfig = (
  config: { component: keyof LayoutViews } & Partial<LayoutConfig>
): LayoutConfig => ({
  component: config.component,
  transform: config.transform ? config.transform : scrollNormal,
  opacity: config.opacity ? config.opacity : opacityNormal,
});

const homePage = layoutConfig({
  component: "Home",
  transform: scrollNormal,
});

const setupPage = layoutConfig({
  component: "Setup",
  transform: scrollParallax,
  opacity: opacityFadeoutAbove(0.0),
});

const setupSynthPage = layoutConfig({
  component: "SetupSynthView",
  opacity: opacityFadeoutAbove(0.0),
});

const listenPage = layoutConfig({
  component: "Listen",
});

export const appLayouts = (state: AppState): LayoutConfig[] => {
  const { value, context } = state;

  const base = [homePage, setupPage];

  switch (value) {
    case "uninitialized":
    case "setupAudio":
      return base;
  }

  if (
    context.synthConfig ||
    value === "setupSynthesizer" ||
    value === "noWebAudio" ||
    value === "error"
  ) {
    base.push(setupSynthPage);
  }

  base.push(listenPage);

  return base;
};

export const pageIndexForState = (state: AppState) => {
  const config = appLayouts(state);
  switch (state.value) {
    case "uninitialized":
      return 0;
    case "noWebAudio":
    case "setupAudio":
      return config.findIndex((page) => page.component === "Setup");
    case "setupSynthesizer":
      return config.findIndex((page) => page.component === "SetupSynthView");
    default:
      return config.findIndex((page) => page.component === "Listen");
  }
};

export const pageStyles$ = (app$: App$) => {
  return fromEvent(window, "scroll").pipe(
    withLatestFrom(app$),
    map(([_, state]) => ({ scrollY: window.scrollY, state: state })),
    startWith({
      scrollY: window.scrollY,
      state: { value: "uninitialized" } as AppState,
    }),
    map(({ scrollY, state }) =>
      appLayouts(state).map((page, index) => ({
        height: `${100 * PAGE_SIZE_FRAC}vh`,
        opacity: page.opacity(scrollY, pageTop(index), pageHeight()),
        willChange: "opacity",
      }))
    )
  );
};
