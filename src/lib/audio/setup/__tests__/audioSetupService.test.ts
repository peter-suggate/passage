import { interpret } from "xstate";
import { done } from "xstate/lib/actions";
import { audioSetupMachine } from "@/views/setup-audio";

function testMachine(optionsIn?: typeof audioSetupMachine.options.services) {
  const options = {
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

// xtest("when setting up audio fails, escalates error to parent", async (done) => {
//   const machine = testMachine({
//     initBrowserAudio: async () => {
//       throw Error("no mic available");
//     },
//   });

//   try {
//     interpret(machine)
//       // .onTransition((state) => {
//       //   if (state.matches("noAudioFound")) {
//       //     done();
//       //   }
//       // })
//       .start();
//   } catch (e) {
//     expect(e).toMatchInlineSnapshot();

//     done();
//   }
// });
