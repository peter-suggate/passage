import { AudioSynthNode } from "../AudioSynthNode";

it("", async () => {
  const node = await AudioSynthNode.create({
    instrument: "bell",
    mode: "major",
    scale: "A",
  });
});
