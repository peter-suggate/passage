import { AudioService, makeAudioService, makeAudio$ } from "./audioService";

export const audioService: AudioService = makeAudioService();

export const audio$ = makeAudio$(audioService);
