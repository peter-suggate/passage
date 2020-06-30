import { AudioValidStates } from "@/lib/audio/audioService";
import HomeView from "@/views/HomeView.vue";
import SetupView from "@/views/SetupView.vue";
import ListenView from "@/views/ListenView.vue";
import { fromEvent } from "rxjs";
import { withLatestFrom, map, startWith, tap } from "rxjs/operators";
import { audio$ } from "@/lib/audio";
import { easeOutSine, easeInQuart } from "./easings";

export type PageComponents = {
  Home: typeof HomeView;
  Setup: typeof SetupView;
  Listen: typeof ListenView;
};

export const pageComponentsTuple = [
  ["Home", HomeView],
  ["Setup", SetupView],
  ["Listen", ListenView],
];

export const pageComponents = {
  Home: HomeView,
  Setup: SetupView,
  Listen: ListenView,
};

export type PageConfig = {
  component: keyof PageComponents;
  transform: (scrollY: number, pageTopY: number, pageHeight: number) => string;
  opacity: (scrollY: number, pageTopY: number, pageHeight: number) => number;
};

const scrollParallax = (
  scrollY: number,
  pageTopY: number,
  pageHeight: number
) => `translateY(${scrollY / 2}px)`;

type Opaque<K, T> = T & { __TYPE__: K };
type Fraction = Opaque<"Fraction", number>;

// export type Fraction = { type: "fraction"; value: number };
export const fraction = (value: number): Fraction => value as Fraction;

const fractionToPixels = (fraction: Fraction, sizePixels: number) =>
  sizePixels * fraction;

export const scrollKeepVisible = (
  beginY: Fraction,
  endY: Fraction,
  easeFn = easeOutSine
) => (scrollY: number, pageTopY: number, pageHeight: number) => {
  const scrollWithinPage = Math.max(0, scrollY - pageTopY);
  let offsetY = fractionToPixels(beginY, pageHeight);
  const beginYPix = fractionToPixels(beginY, pageHeight);
  if (scrollWithinPage > beginYPix) {
    offsetY +=
      (scrollWithinPage - beginYPix) *
      easeInQuart(scrollWithinPage - beginYPix);
  }
  // const maxTravel = pageHeight - pixFromTopOfView;
  // console.log(
  //   maxTravel * easeFn((scrollY - pageTopY) / pageHeight),
  //   scrollY,
  //   pageTopY,
  //   pageHeight,
  //   maxTravel
  // );
  return offsetY;
};

const scrollNormal = (_scrollY: number, pageTopY: number, pageHeight: number) =>
  "inherit";

const opacityNormal = (_scrollY: number, _pageTopY: number) => 1.0;
const opacityFadeinout = (pageVisibleFractionForFullOpacity = 0.3) => (
  scrollY: number,
  pageTopY: number,
  pageHeight: number
) => {
  const viewCenter = scrollY + 0.5 * pageHeight;
  const pageCenter = pageTopY + 0.5 * pageHeight;

  const distFromCenter = fraction(
    Math.abs(viewCenter - pageCenter) / pageHeight
  );
  const opacity =
    1 - Math.max(0, distFromCenter - pageVisibleFractionForFullOpacity);
  return easeInQuart(opacity);
};

const pageConfig = (
  config: { component: keyof PageComponents } & Partial<PageConfig>
): PageConfig => ({
  component: config.component,
  transform: config.transform ? config.transform : scrollNormal,
  opacity: config.opacity ? config.opacity : opacityNormal,
});

const homePage = pageConfig({
  component: "Home",
  transform: scrollNormal,
});

const setupPage = pageConfig({
  component: "Setup",
  transform: scrollParallax,
  opacity: opacityFadeinout(0.1),
});

const listenPage = pageConfig({
  component: "Listen",
  // opacity: opacityFadein(0.3),
});

export const appPageConfigs: Record<AudioValidStates, PageConfig[]> = {
  uninitialized: [homePage, setupPage],
  setupStart: [homePage, setupPage],
  error: [homePage, setupPage],
  resuming: [homePage, setupPage, listenPage],
  running: [homePage, setupPage, listenPage],
  suspended: [homePage, setupPage, listenPage],
};

export const PAGE_OVERLAP = fraction(0.1);
export const PAGE_SIZE_FRAC = 1.0 - PAGE_OVERLAP;

export const pageHeight = () => PAGE_SIZE_FRAC * window.innerHeight;
export const pageTop = (pageIndex: number) => pageIndex * pageHeight();
export const pageBottom = (pageIndex: number) =>
  pageTop(pageIndex) + pageHeight();

export const pageStyles$ = () => {
  return fromEvent(window, "scroll").pipe(
    withLatestFrom(audio$),
    map(([_, state]) => ({ scrollY: window.scrollY, state: state.value })),
    startWith({ scrollY: window.scrollY, state: "uninitialized" }),
    // tap(({ scrollY, state }) =>
    //   console.log("scrollY", scrollY, "state", state)
    // ),
    map(({ scrollY, state }) =>
      appPageConfigs[state as AudioValidStates].map((page, index) => ({
        height: `${100 * PAGE_SIZE_FRAC}vh`,
        // transform: page.transform(
        //   scrollY,
        //   index * window.innerHeight,
        //   window.innerHeight
        // ),
        opacity: page.opacity(scrollY, pageTop(index), pageHeight()),
        willChange: "opacity",
        background:
          index === 0 ? "transparent" : index === 1 ? "transparent" : "green", // willChange: "transform, opacity",
      }))
    )
  );
};

export const viewTop = (scrollY: number) => scrollY;
export const viewBottom = (scrollY: number) => scrollY + window.innerHeight;

const visiblePageFrac = (scrollY: number, pageIndex: number) => {
  const top = Math.max(pageTop(pageIndex), viewTop(scrollY));
  const bottom = Math.min(pageBottom(pageIndex), viewBottom(scrollY));
  return Math.max(0, fraction((bottom - top) / pageHeight()));
};

export const pageScrollY$ = (pageIndex: number) => {
  return fromEvent(window, "scroll").pipe(
    map(() => window.scrollY),
    startWith(window.scrollY),
    map((scrollY) => ({
      scrollY,
      scrollYRelPage: scrollY - pageTop(pageIndex),
      scrollYRelPageFrac: fraction(
        (scrollY - pageTop(pageIndex)) / pageHeight()
      ),
      visiblePageFrac: visiblePageFrac(scrollY, pageIndex),
      pageTopY: pageTop(pageIndex),
      pageHeight: pageHeight(),
    }))
  );
};

// export const scrollKeepVisibleStyle$ = (
//   pageIndex: number,
//   beginY: Fraction,
//   endY: Fraction
// ) => {
//   return fromEvent(window, "scroll").pipe(
//     map(() => window.scrollY),
//     startWith(window.scrollY),
//     map((scrollY) => {
//       const offset = scrollKeepVisible(beginY, endY)(
//         scrollY,
//         pageIndex * window.innerHeight,
//         window.innerHeight
//       );

//       if (offset > 0) {
//         return {
//           transform: `translateY(${offset}px)`,
//           willChange: "transform",
//         };
//       }

//       return {
//         position: "sticky",
//         top: beginY,
//       };
//     })
//   );
// };

export const opacityFadeout = (
  scrollYRelPageFrac: Fraction,
  scrollFractionFullyHidden: Fraction
) => Math.max(0, 1.0 - scrollYRelPageFrac / scrollFractionFullyHidden);

export const offsetInPage = (posY: Fraction) => `translateY(${posY * 100}vh)`;

// export const fixedPositionInPage = (posY: Fraction) =>
//   scrollKeepVisible(posY, posY);

export const hideOnScrollStyle$ = (
  pageIndex: number,
  scrollFractionForHidden: Fraction
) => {
  return pageScrollY$(pageIndex).pipe(
    map(({ scrollYRelPageFrac }) => ({
      opacity: Math.max(0, 1.0 - scrollYRelPageFrac / scrollFractionForHidden),
      willChange: "opacity",
    }))
  );
};
