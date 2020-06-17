<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <Logo />
        </v-row>
      </v-col>

      <v-col class="mb-4">
        <br />
        <h1 class="h1">{{ status.title }}...</h1>
        <h2 v-if="status.message" class="h2">{{ status.message }}...</h2>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Logo from "@/components/general/Logo.vue";
import { Routes } from "@/router/Routes";
import { map } from "rxjs/operators";
import { audio$, audioService } from "../lib/audio";

export default Vue.extend({
  name: "SetupAudio",

  components: {
    Logo
  },

  data: () => ({
    Routes,
    current: audioService.initialState
  }),

  created() {
    audioService.onTransition(state => {
      this.current = state;
    });
  },

  subscriptions: function(this) {
    return {
      status: audio$.pipe(
        map(e => {
          if (e.value === "inSetup") {
            const setupService = audioService.children.get("setup");

            if (setupService) {
              const setupState = setupService.state;

              switch (setupState.value) {
                case "detectingAudio":
                  return {
                    title: "Initializing",
                    message: "Detecting microphone"
                  };
                case "createAudioAnalyzer":
                  return {
                    title: "Initializing",
                    message: "Loading analyzers"
                  };
                case "noAudioFound":
                  return { title: "No microphone found" };
                case "analyzerError":
                  return {
                    title: "Couldn't complete audio setup",
                    message: setupState.context.message
                  };
                default:
                  return {
                    title: e.value,
                    message: setupState.context.message
                  };
              }
              // e.children.audioSetupMachine;
              // audioService.children['']
            }
          }

          return {
            title: "Error",
            message: "Shouldn't ever get here"
          };
          // console.log(e.value);
          // switch (e.value) {
          // }
        })
      )
    };
  }

  // subscriptions: function(this) {
  //   // const service = audioSetupService();

  //   // service.send("DETECT");

  //   return {
  //     status: audio$.pipe(
  //       tap((e) => {
  //         if (e.value === "resume") {
  //           this.$router.push({ path: Routes.Listen });
  //         }
  //       }),
  //       map((e) => {
  //         console.log(e.value);
  //         switch (e.value) {
  //           case "detectingAudio":
  //             return { title: "Initializing", status: "Detecting microphone" };
  //           case "createAudioAnalyzer":
  //             return { title: "Initializing", message: "Loading analyzers" };
  //           case "noAudioFound":
  //             return { title: "No microphone found" };
  //           default:
  //             return { title: e.value, message: e.context.message };
  //         }
  //       })
  //     ),
  //   };
  // },
});
</script>
