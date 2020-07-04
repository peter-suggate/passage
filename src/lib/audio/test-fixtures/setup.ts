import "./AudioContext";
import "./AudioWorkletProcessor";
import "./AudioWorkletNode";
import "./Media";
import "./fetch";
require("./text-encoder");

(window as any).TextDecoder = globalThis.TextDecoder;
(window as any).TextEncoder = globalThis.TextEncoder;
