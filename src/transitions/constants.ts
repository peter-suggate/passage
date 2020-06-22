import gsap from "gsap";

export const ANIM_CONSTANTS = {
  routerTransitionMs: 600,
};

export type ElementDisplayState = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export const VIEW_ELEM_ID = "viewContainer";
export const PRIMARY_ACTION_ELEM_ID = "primaryActionButton";
export type TransitionElements =
  | typeof VIEW_ELEM_ID
  | typeof PRIMARY_ACTION_ELEM_ID;

export const viewElementIds = [VIEW_ELEM_ID, PRIMARY_ACTION_ELEM_ID];

const viewDisplayStates = new Map<string, ElementDisplayState>();

export const viewDisplayState = (id: TransitionElements) =>
  viewDisplayStates.get(id);

export const updateViewDisplayState = (elemId: string) => {
  const elem = document.querySelector(`#${elemId}`);
  if (elem) {
    viewDisplayStates.set(elemId, {
      width: elem.clientWidth,
      height: elem.clientHeight,
      top: elem.clientTop,
      left: elem.clientLeft,
    });
  }
};

export const animateTransition = (
  id: TransitionElements,
  tl?: TimelineLite,
  startSec?: number,
  durationSec?: number
) => {
  const viewState = viewDisplayState(id);
  if (!viewState) return;
  console.log(
    `animating ${id} props from: top: ${viewState.top}, height: ${viewState.height}, left: ${viewState.left}, width: ${viewState.width}`
  );
  for (const prop in viewState) {
    const anim = (tl ? tl : gsap).from(
      `#${VIEW_ELEM_ID}`,
      {
        [prop]: `${viewState[prop as keyof ElementDisplayState]}`,
        duration: (durationSec || ANIM_CONSTANTS.routerTransitionMs) / 1000,
        ease: "power4",
        // clearProps: "all",
      },
      startSec || 0
    );
    if (!tl) {
      anim.play();
    }
  }
};

export const animateTransitions = (ids: TransitionElements[]) => {
  const tl = gsap.timeline();
  const secsPerAnim = ANIM_CONSTANTS.routerTransitionMs / ids.length;
  ids.forEach((id, index) => {
    animateTransition(id, tl, index * secsPerAnim, secsPerAnim);
  });
  tl.play();
};
