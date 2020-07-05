import { setupSynthesizerMachine } from "../setupSynthesizerMachine";
import { AudioSynthNode } from "../../recorder/synthaudio/AudioSynthNode";
import { interpret } from "xstate";

function testMachine(optionsIn?: { createSynthAudio: () => Promise<void> }) {
  const options = {
    createSynthAudio: AudioSynthNode.create,
    ...optionsIn,
  };

  return setupSynthesizerMachine.withConfig({
    services: {
      createSynthAudio: (context, event) => options.createSynthAudio(),
    },
  });
}

it("has useful initial synth config", () => {
  const machine = testMachine();

  expect(machine.initialState.context).toMatchInlineSnapshot(`
    Object {
      "config": Object {
        "instrument": "bell",
        "mode": "major",
        "scale": "C",
      },
      "node": undefined,
    }
  `);
});

it("remembers configuration sent to it via update config event", () => {
  const machine = testMachine();

  expect(
    machine.transition(machine.initialState, {
      type: "UPDATE_CONFIG",
      config: { instrument: "violin" },
    }).context
  ).toMatchObject({
    config: {
      instrument: "violin",
    },
  });
});

describe("when configuration has finished", () => {
  test("transitions to starting the synthesizer", () => {
    const machine = testMachine();

    expect(
      machine.transition(machine.initialState, {
        type: "FINISH",
      }).value
    ).toBe("startGenerator");
  });

  test("when starting the synthesizer succeeds, transitions to success", async (done) => {
    const machine = testMachine();

    const service = interpret(machine)
      .onTransition((state) => {
        if (state.matches("success")) {
          done();
        }
      })
      .start();

    service.send({ type: "FINISH" });
  });

  test("when starting the synthesizer fails, transitions to error", async (done) => {
    const machine = testMachine({
      createSynthAudio: async () => {
        throw Error("Synth creation failed");
      },
    });

    const service = interpret(machine)
      .onTransition((state) => {
        if (state.matches("error")) {
          done();

          expect(state.context.message).toEqual("Synth creation failed");
        }
      })
      .start();

    service.send({ type: "FINISH" });
  });
});
