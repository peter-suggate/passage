<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col cols="12" sm="12" md="4">
        <!-- <v-sheet
          :elevation="Math.round(15 * pageScrollY$.visiblePageFrac)"
          style="background: transparent; padding: 20px"
        > -->
        <v-icon style="font-size: 6rem;">mdi-microphone-outline</v-icon>
        <br />
        <h1 class="h1">{{ status$.title }}</h1>
        <!-- <h2 class="h2">
          {{
            state.value === "setupStart"
              ? "Setting up audio"
              : "Audio recording not configured"
          }}...
        </h2> -->
        <!-- <h2 v-if="status.message" class="h2">{{ status.message }}</h2> -->
        <br />
        <v-btn v-if="status$.settingUp" v-on:click="send('CANCEL')"
          >Cancel setup</v-btn
        >
        <!-- </v-sheet> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Routes } from "@/router/Routes";
import { map } from "rxjs/operators";
import { audio$ } from "../lib/audio";

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

  components: {
    // Logo,
  },

  data: () => ({
    Routes,
  }),

  subscriptions: function(this) {
    return {
      // pageScrollY$: pageScrollY$(1),
      status$: audio$.pipe(
        map((e) => {
          switch (e.value) {
            case "uninitialized":
            case "setupStart": {
              return {
                title: "Configuring recording",
                settingUp: true,
              };
            }
            case "error":
              return { title: `Error: ${e.context.message}`, settingUp: false };
            case "resuming":
            case "running":
            default: {
              return {
                title: "Mic found",
                settingUp: false,
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
      ),
    };
  },

  methods: {
    cancel: function() {
      // audioService.send("START");
    },
  },
});
</script>
