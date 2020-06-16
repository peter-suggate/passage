import { createModel } from "@xstate/test";
import {
  audioSetupService,
  audioSetupMachine,
  audioSetup$,
  AudioSetupState,
} from "../audioSetupService";
import { MediaStream } from "@/lib/audio/test-fixtures";
import { cast } from "@/lib/testing/partial-impl";
// import { getWebAudioMediaStream } from "../audioSetupEffects";

// jest.mock("../audioSetupEffects", () => ({
//   getWebAudioMediaStream: jest.fn(async () => {
//     return new MediaStream();
//     // throw Error("No mic available");
//   }),
// }));

jest.mock("../audioSetupEffects");

import { getWebAudioMediaStream } from "../audioSetupEffects";
import { expectEvents$, expectServiceEvents$ } from "@/lib/testing/rx-testing";

it("enters appropriate error state when no audio device is found", (done) => {
  cast<jest.Mock>(getWebAudioMediaStream).mockRejectedValueOnce(
    new Error("no mic available")
  );

  const service = audioSetupService();

  expectServiceEvents$<AudioSetupState>(
    audioSetup$(service),
    [
      { value: "uninitialized" },
      { value: "detectingAudio" },
      { value: "noAudioFound" },
    ],
    done
  );

  service.send("DETECT");
});

it("is awesom", (done) => {
  cast<jest.Mock>(getWebAudioMediaStream).mockResolvedValueOnce(
    new MediaStream()
  );

  const service = audioSetupService();

  expectServiceEvents$<AudioSetupState>(
    audioSetup$(service),
    [
      { value: "uninitialized" },
      { value: "detectingAudio" },
      { value: "createAudioAnalyzer" },
      { value: "resume" },
    ],
    done
  );

  service.send("DETECT");
});

const toggleModel = createModel(audioSetupMachine).withEvents({
  DETECT: {
    exec: async (page) => {
      // console.log(page);
      // await page.click("input");
    },
  },
});

describe("toggle", () => {
  const testPlans = toggleModel.getShortestPathPlans();

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      plan.paths.forEach((path) => {
        it(path.description, async () => {
          // do any setup, then...

          await path.test({ hello: "ted" });
        });
      });
    });
  });

  xit("should have full coverage", () => {
    return toggleModel.testCoverage();
  });
});
