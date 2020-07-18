import { fromEvent } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Opaque } from "@/lib/fp-util/opaque";
import { easeOutSine, easeInQuart } from "./easings";

export const scrollParallax = (
  scrollY: number,
  pageTopY: number,
  pageHeight: number
) => `translateY(${scrollY / 2}px)`;

type Fraction = Opaque<"Fraction", number>;

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
  return offsetY;
};

export const scrollNormal = (
  _scrollY: number,
  pageTopY: number,
  pageHeight: number
) => "inherit";

export const opacityNormal = (_scrollY: number, _pageTopY: number) => 1.0;
export const opacityFadeinout = (pageVisibleFractionForFullOpacity = 0.3) => (
  scrollY: number,
  pageTopY: number,
  pageHeight: number
) => {
  const viewCenter = scrollY + 0.5 * pageHeight;
  const pageCenter = pageTopY + 0.5 * pageHeight;

  const distFromCenter =
    2 * fraction(Math.abs(viewCenter - pageCenter) / pageHeight);

  const opacity =
    1 - Math.max(0, distFromCenter - pageVisibleFractionForFullOpacity);
  return easeInQuart(opacity);
};

export const opacityFadeoutAbove = (
  pageVisibleFractionForFullOpacity = 0.3
) => (scrollY: number, pageTopY: number, pageHeight: number) => {
  const viewCenter = scrollY + 0.5 * pageHeight;
  const pageCenter = pageTopY + 0.5 * pageHeight;

  const distFromCenter = 2 * fraction((viewCenter - pageCenter) / pageHeight);

  const opacity =
    1 - Math.max(0, distFromCenter - pageVisibleFractionForFullOpacity);
  return easeInQuart(opacity);
};

export const PAGE_OVERLAP = fraction(0.05);
export const PAGE_SIZE_FRAC = 1.0 - PAGE_OVERLAP;

export const pageHeight = () => PAGE_SIZE_FRAC * window.innerHeight;
export const pageTop = (pageIndex: number) => pageIndex * pageHeight();
export const pageBottom = (pageIndex: number) =>
  pageTop(pageIndex) + pageHeight();

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

export const opacityFadeout = (
  scrollYRelPageFrac: Fraction,
  scrollFractionFullyHidden: Fraction
) => Math.max(0, 1.0 - scrollYRelPageFrac / scrollFractionFullyHidden);

export const offsetInPage = (posY: Fraction) => `translateY(${posY * 100}vh)`;

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
