import { interpret } from "xstate";
import { appMachine, AppServiceContext } from "../appService";
import { audioSetupMachine } from "@/views/setup-audio";
import { resumeAudio, suspendAudio } from "@/lib/audio/audioEffects";
import { sessionMachine } from "@/views/session/sessionService";
import { setupSynthesizerMachine } from "@/views/setup-synth";

function testMachine(optionsIn?: typeof appMachine.options.services) {
  const options = {
    audioSetup: (context: AppServiceContext) => audioSetupMachine,
    resume: (context: AppServiceContext) => resumeAudio(context.audio!),
    suspend: (context: AppServiceContext) => suspendAudio(context.audio!),
    analyzer: () => sessionMachine,
    setupSynthesizer: () => setupSynthesizerMachine,
    ...optionsIn,
  };

  return appMachine.withConfig({
    services: options,
  });
}

it("enters setup when started", () => {
  const machine = testMachine();

  expect(machine.transition(machine.initialState, "START").value).toBe(
    "setupAudio"
  );
});

test("when setting up audio fails, transitions to no web audio", async (done) => {
  const machine = testMachine({
    audioSetup: async () => {
      throw Error("Setup audio failed");
    },
  });

  const service = interpret(machine)
    .onTransition((state) => {
      if (state.matches("noWebAudio")) {
        done();
      }
    })
    .start();

  service.send({ type: "START" });
});

it("enters setup synthesizer when using synthesizer", () => {
  const machine = testMachine();

  expect(machine.transition(machine.initialState, "USE_SYNTH").value).toBe(
    "setupSynthesizer"
  );
});

test("when setting up the synthesizer fails, transitions to error", async (done) => {
  const machine = testMachine({
    setupSynthesizer: async () => {
      throw Error("Setup synth failed");
    },
  });

  const service = interpret(machine)
    .onTransition((state) => {
      if (state.matches("error")) {
        done();
      }
    })
    .start();

  service.send({ type: "USE_SYNTH" });
});

test("when setting up the synthesizer succeeds, transitions to resuming", async (done) => {
  const machine = testMachine();

  const service = interpret(machine)
    .onTransition((state) => {
      if (state.matches("resuming")) {
        done();
      }
    })
    .start();

  service.send({ type: "USE_SYNTH" });

  service.children.get("setupSynthesizer")!.send({ type: "FINISH" });
});

// it("should go to resuming state when audio setup succeeds", async (done) => {
//   const audio = new TestAudioContext();
//   const audioSetup = async () => audio;

//   const machine = testMachine({
//     audioSetup,
//   });

//   interpret(machine)
//     .onTransition((state) => {
//       if (state.matches("resuming")) {
//         expect(state.context.audio).toEqual(audio);

//         done();
//       }
//     })
//     .start()
//     .send("START");
// });
