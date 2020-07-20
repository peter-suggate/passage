import "./worker-polyfills/text-encoder.js";
import init, {
  AudioSamplesProcessor,
} from "./music-analyzer-wasm-rs/music_analyzer_wasm_rs.js";

const SinewaveBuilder = (sampleRate) => {
  let x = 0;

  const invSampleRate = 1 / sampleRate;

  return {
    next: (atFreq) => {
      x += 2 * Math.PI * atFreq * invSampleRate;
      return Math.sin(x);
    },
  };
};

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.port.onmessage = (event) => this.onmessage(event.data);

    this.iteration = 0;

    this.sinewaveBuilder = SinewaveBuilder(sampleRate);
  }

  async loadWasm(wasmBytes) {
    init(WebAssembly.compile(wasmBytes)).then(() => {
      console.log("wasm module compiled and ready to go");

      this.wasmSamplesProcessor = AudioSamplesProcessor.new();

      this.pitchDetector = this.wasmSamplesProcessor.create_pitch_detector(
        "McLeod",
        1024,
        sampleRate,
        0.75,
        0.75
      );

      this.port.postMessage({
        type: "initialized",
      });
    });
  }

  onmessage = (eventData) => {
    switch (eventData.type) {
      case "load-wasm-module": {
        this.loadWasm(eventData.wasmBytes);
        break;
      }
    }
  };

  process(inputs, outputs) {
    // By default, the node has single input and output.
    const input = inputs[0];

    const numInputChannels = input.length;
    if (numInputChannels < 1) {
      return false;
    }

    const updatesPerSecond = sampleRate / 128;
    const desiredUpdatesPerSecond = updatesPerSecond;
    const iterationsPerUpdate = Math.ceil(
      updatesPerSecond / desiredUpdatesPerSecond
    );

    const inputSamples = input[0];

    // const output = outputs[0];
    // output[channel].set(input[channel]);
    // for (let dx = 0; dx < 128; dx++)
    //   inputSamples[dx] = this.sinewaveBuilder.next(440);

    this.wasmSamplesProcessor.add_samples_chunk(inputSamples);

    if (
      this.pitchDetector &&
      ++this.iteration % iterationsPerUpdate === 0 &&
      this.wasmSamplesProcessor.has_sufficient_samples()
    ) {
      try {
        this.wasmSamplesProcessor.set_latest_samples_on(this.pitchDetector);

        const result = this.pitchDetector.pitches();

        if (result.code !== "success") {
          console.log("error getting pitches");
        } else {
          const pitches = result.pitches;
          if (pitches.length > 0) {
            this.port.postMessage({
              type: "pitches",
              result: pitches.map((p) => ({
                frequency: p.frequency,
                clarity: p.clarity,
                t: p.t,
                onset: p.onset,
              })),
            });

            pitches.forEach((p) => p.free());
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
