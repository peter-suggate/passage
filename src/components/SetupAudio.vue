<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col cols="12" sm="12" md="4">
        <v-icon style="font-size: 6rem;">mdi-microphone-outline</v-icon>
        <br />
        <h1 class="h1">{{ status.title }}</h1>
        <br />
        <v-row>
          <v-btn v-if="status.retryable" @click="useSynthesizer">Generate waveform</v-btn>
        </v-row>
        <v-btn v-if="status.retryable" @click="send('RETRY')">Retry</v-btn>
        <v-btn v-if="status.cancellable" @click="send('CANCEL')">Cancel</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { useService } from "@xstate/vue";
import { map } from "rxjs/operators";
import { audio$, audioService } from "../lib/audio";
import { pageHeight } from "../transitions/page-transforms";
import {
  AudioSetupService,
  AudioSetupState,
  AudioSetupEvent,
  AudioSetupContext
} from "../lib/audio/setup";
import { reactive, ref } from "@vue/composition-api";

type Status = {
  icon: "mdi-microphone" | "mdi-microphone-off" | "mdi-microphone-outline";
  title: string;
  message: string;
  cancellable: boolean;
  retryable: boolean;
};

const statusFromState = (state: AudioSetupState): Status => {
  switch (state.value) {
    case "noAudioFound":
      return {
        icon: "mdi-microphone-off",
        title: "Setup failed",
        message:
          state.context.message || "Audio recorder not available or allowed",
        cancellable: false,
        retryable: true
      };
    case "cancelled":
      return {
        icon: "mdi-microphone-off",
        title: "Cancelled",
        message: "",
        cancellable: false,
        retryable: true
      };
    case "detectingAudio":
    case "createAudioAnalyzer":
      return {
        icon: "mdi-microphone-outline",
        title: "Detecting...",
        message: "",
        cancellable: true,
        retryable: false
      };
    case "analyzerCreated":
      return {
        icon: "mdi-microphone",
        title: "Ready",
        message: "Microphone found",
        cancellable: false,
        retryable: false
      };
    case "analyzerError":
      return {
        icon: "mdi-microphone-off",
        title: "Error",
        message:
          state.context.message ||
          "Unknown error occurred finding recording device. Check you have a working microphone and it is enabled for this website in your browser settings.",
        cancellable: false,
        retryable: true
      };
  }
};

type Props = {
  service: AudioSetupService;
};

export default {
  props: {
    service: Object
  },

  setup(propsUnknown: unknown) {
    const props = propsUnknown as Props;
    // const status = reactive({
    //     title: ''
    //   // count: 0,
    //   // double: computed(() => state.count * 2)
    // })

    // audioService.onTransition(state => {
    //   if (state.value === 'setupStart') {
    //     const audioSetupService = audioService.children.get("audio-setup")!;

    //     audioService.state.context.analyzer$
    //     // status.title =
    //   }
    // })
    const { state, send, service } = useService(
      props.service as AudioSetupService
    );

    // let serviceState = ref(state.value);

    const status = ref(statusFromState(state.value as AudioSetupState));

    service.value.onTransition(e => {
      console.warn("transition", e.value, e.context.message);
      status.value = statusFromState(e as AudioSetupState);
    });

    const useSynthesizer = () => {
      // audioService.send("USE_SYNTH");
      send("CANCEL");

      window.scrollBy({
        top: pageHeight(),
        behavior: "smooth"
      });
    };

    return {
      // state,
      send,
      status,
      useSynthesizer
      // status: statusFromState(serviceState.value as AudioSetupState)
    };
  }
};

// export default Vue.extend({
//   name: "SetupAudio",

//   methods: {
//     useSynthesizer: function() {
//       audioService.send("USE_SYNTH");

//       window.scrollBy({
//         top: pageHeight(),
//         behavior: "smooth"
//       });
//     },

//     retry: function() {
//       this.audioSetupService.send("RETRY");
//     },

//     cancel: function() {
//       this.audioSetupService.send("CANCEL");
//     }
//   },

//   props: {
//     audioSetupService: Object
//   },

//   data: function() {
//     return {
//       setupState: { value: "detectingAudio" }
//     } as { setupState: AudioSetupState };
//   },

//   created: function() {
//     (this.audioSetupService as AudioSetupService).onTransition(state => {
//       this.setupState = state as AudioSetupState;
//       // switch (state.value) {
//       //   case "noAudioFound":
//       //     break;
//       //   default:
//       //     break;
//       // }
//       // this.activePages = appPageConfig(state as AudioState);
//     });
//   },

//   subscriptions: function() {
//     return {
//       status$: audio$.pipe(
//         map(e => {
//           switch (e.value) {
//             case "uninitialized":
//             case "setupStart": {
//               return {
//                 title: "Detecting microphone",
//                 settingUp: true
//               };
//             }
//             case "noWebAudio":
//             case "error":
//             case "setupSynthesizer":
//               return {
//                 title: `${e.context.message}`,
//                 error: true,
//                 settingUp: false
//               };
//             case "resuming":
//             case "running":
//             default: {
//               return {
//                 title: "Mic found",
//                 error: false,
//                 settingUp: false
//               };
//             }
//           }
//           // if (e.value === "uninitialized") {
//           //   return {
//           //     title: "Not setup",
//           //     message: "keep scrolling down..",
//           //   };
//           // } else if (e.value === "setupStart") {
//           //   return {};
//           //   // const setupService = audioService.children.get("audio-setup");

//           //   // if (setupService) {
//           //   //   const setupState = setupService.state;

//           //   //   switch (setupState.value) {
//           //   //     case "detectingAudio":
//           //   //       return {
//           //   //         title: "Starting",
//           //   //         message: "Detecting microphone...",
//           //   //       };
//           //   //     case "createAudioAnalyzer":
//           //   //       return {
//           //   //         title: "Starting",
//           //   //         message: "Loading analyzers...",
//           //   //       };
//           //   //     case "noAudioFound":
//           //   //       return { title: "No microphone found" };
//           //   //     case "analyzerError":
//           //   //       return {
//           //   //         title: "Couldn't complete audio setup",
//           //   //         message: setupState.context.message,
//           //   //       };
//           //   //     default:
//           //   //       return {
//           //   //         title: e.value,
//           //   //         message: setupState.context.message,
//           //   //       };
//           //   //   }
//           //   // }
//           // }

//           // return {
//           //   title: "Setup complete",
//           //   message: "Keep scrolling down..",
//           //   settingUp: false
//           // };
//         })
//       )
//     };
//   }
// });
</script>
