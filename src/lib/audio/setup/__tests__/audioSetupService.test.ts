import { interpret } from "xstate";
import { audioSetupMachine, AudioSetupContext } from "../audioSetupService";

function testMachine(optionsIn?: typeof audioSetupMachine.options.services) {
  const options = {
    // initBrowserAudio: (context: AudioSetupContext) => audioSetupMachine,
    ...optionsIn,
  };

  return audioSetupMachine.withConfig({
    services: options,
  });
}

it("is initially in detecting audio state", () => {
  const machine = testMachine();

  expect(machine.initialState.matches("detectingAudio"));
});

test("when setting up audio fails, transitions to no web audio", async (done) => {
  const machine = testMachine({
    initBrowserAudio: async () => {
      throw Error("no mic available");
    },
  });

  interpret(machine)
    .onTransition((state) => {
      if (state.matches("noAudioFound")) {
        done();
      }
    })
    .start();

  // service.send({ type: "START" });
});

// it("enters setup synthesizer when using synthesizer", () => {
//   const machine = testMachine();

//   expect(machine.transition(machine.initialState, "USE_SYNTH").value).toBe(
//     "setupSynthesizer"
//   );
// });

// test("when setting up the synthesizer fails, transitions to error", async (done) => {
//   const machine = testMachine({
//     setupSynthesizer: async () => {
//       throw Error("Setup synth failed");
//     },
//   });

//   const service = interpret(machine)
//     .onTransition((state) => {
//       if (state.matches("error")) {
//         done();
//       }
//     })
//     .start();

//   service.send({ type: "USE_SYNTH" });
// });

// test("when setting up the synthesizer succeeds, transitions to resuming", async (done) => {
//   const machine = testMachine();

//   const service = interpret(machine)
//     .onTransition((state) => {
//       if (state.matches("resuming")) {
//         done();
//       }
//     })
//     .start();

//   service.send({ type: "USE_SYNTH" });

//   service.children.get("setupSynthesizer")!.send({ type: "FINISH" });
// });

// import { createModel } from "@xstate/test";
// import {
//   makeAudioSetupService,
//   audioSetupMachine,
//   audioSetup$,
//   AudioSetupState,
// } from "../audioSetupService";
// import { MediaStream } from "@/lib/audio/test-fixtures";
// import { cast } from "@/lib/testing/partial-impl";
// // import { getWebAudioMediaStream } from "../audioSetupEffects";

// // jest.mock("../audioSetupEffects", () => ({
// //   getWebAudioMediaStream: jest.fn(async () => {
// //     return new MediaStream();
// //     // throw Error("No mic available");
// //   }),
// // }));

// jest.mock("../audioSetupEffects");

// import { getWebAudioMediaStream } from "../audioSetupEffects";
// import { expectEvents$, expectServiceEvents$ } from "@/lib/testing/rx-testing";

// it("enters appropriate error state when no audio device is found", (done) => {
//   cast<jest.Mock>(getWebAudioMediaStream).mockRejectedValueOnce(
//     new Error("no mic available")
//   );

//   const service = makeAudioSetupService();

//   expectServiceEvents$<AudioSetupState>(
//     audioSetup$(service),
//     [
//       { value: "uninitialized" },
//       { value: "detectingAudio" },
//       { value: "noAudioFound" },
//     ],
//     done
//   );

//   service.send("DETECT");
// });

// it("is awesom", (done) => {
//   cast<jest.Mock>(getWebAudioMediaStream).mockResolvedValueOnce(
//     new MediaStream()
//   );

//   const service = makeAudioSetupService();

//   expectServiceEvents$<AudioSetupState>(
//     audioSetup$(service),
//     [
//       { value: "uninitialized" },
//       { value: "detectingAudio" },
//       { value: "createAudioAnalyzer" },
//       { value: "analyzerSuspended" },
//     ],
//     done
//   );

//   service.send("DETECT");
// });

// const toggleModel = createModel(audioSetupMachine).withEvents({
//   DETECT: {
//     exec: async (page) => {
//       // console.log(page);
//       // await page.click("input");
//     },
//   },
// });

// describe("toggle", () => {
//   const testPlans = toggleModel.getShortestPathPlans();

//   testPlans.forEach((plan) => {
//     describe(plan.description, () => {
//       plan.paths.forEach((path) => {
//         it(path.description, async () => {
//           // do any setup, then...

//           await path.test({ hello: "ted" });
//         });
//       });
//     });
//   });

//   xit("should have full coverage", () => {
//     return toggleModel.testCoverage();
//   });
// });
