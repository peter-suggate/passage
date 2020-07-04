<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col cols="12" sm="12" md="4">
        <v-icon style="font-size: 6rem;">mdi-microphone-outline</v-icon>
        <br />
        <h1 class="h1">{{ status$.title }}</h1>
        <br />
        <v-btn v-if="status$.error" v-on:click="useSynthesizer">Generate audio</v-btn>
        <v-btn v-if="status$.settingUp" v-on:click="send('CANCEL')">Cancel setup</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { map } from "rxjs/operators";
import { audio$, audioService } from "../lib/audio";
import { pageHeight } from "../transitions/page-transforms";

// export default {
//   setup() {
//     // const status = reactive({
//     //     title: ''
//     //   // count: 0,
//     //   // double: computed(() => state.count * 2)
//     // })

//     // audioService.onTransition(state => {
//     //   if (state.value === 'setupStart') {
//     //     const audioSetupService = audioService.children.get("audio-setup")!;

//     //     audioService.state.context.analyzer$
//     //     // status.title =
//     //   }
//     // })

//     const { state, send } = useService(audioService);

//     return {
//       state,
//       send,
//     };
//   },
// };

export default Vue.extend({
  name: "SetupAudio",

  methods: {
    useSynthesizer: function() {
      audioService.send("USE_SYNTH");

      window.scrollBy({
        top: pageHeight(),
        behavior: "smooth"
      });
    }
  },

  subscriptions: function(this) {
    return {
      status$: audio$.pipe(
        map(e => {
          switch (e.value) {
            case "uninitialized":
            case "setupStart": {
              return {
                title: "Detecting microphone",
                settingUp: true
              };
            }
            case "error":
            case "setupSynthesizer":
              return {
                title: `${e.context.message}`,
                error: true,
                settingUp: false
              };
            case "resuming":
            case "running":
            default: {
              return {
                title: "Mic found",
                error: false,
                settingUp: false
              };
            }
          }
          // if (e.value === "uninitialized") {
          //   return {
          //     title: "Not setup",
          //     message: "keep scrolling down..",
          //   };
          // } else if (e.value === "setupStart") {
          //   return {};
          //   // const setupService = audioService.children.get("audio-setup");

          //   // if (setupService) {
          //   //   const setupState = setupService.state;

          //   //   switch (setupState.value) {
          //   //     case "detectingAudio":
          //   //       return {
          //   //         title: "Starting",
          //   //         message: "Detecting microphone...",
          //   //       };
          //   //     case "createAudioAnalyzer":
          //   //       return {
          //   //         title: "Starting",
          //   //         message: "Loading analyzers...",
          //   //       };
          //   //     case "noAudioFound":
          //   //       return { title: "No microphone found" };
          //   //     case "analyzerError":
          //   //       return {
          //   //         title: "Couldn't complete audio setup",
          //   //         message: setupState.context.message,
          //   //       };
          //   //     default:
          //   //       return {
          //   //         title: e.value,
          //   //         message: setupState.context.message,
          //   //       };
          //   //   }
          //   // }
          // }

          // return {
          //   title: "Setup complete",
          //   message: "Keep scrolling down..",
          //   settingUp: false
          // };
        })
      )
    };
  }
});
</script>
