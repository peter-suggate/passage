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
import { audioSetupService, audioSetup$ } from "@/lib/audio/setup";
import { map, tap } from "rxjs/operators";

export default Vue.extend({
  name: "SetupAudio",

  components: {
    Logo,
  },

  data: () => ({
    Routes,
  }),

  subscriptions: function(this) {
    const service = audioSetupService();

    service.send("DETECT");

    return {
      status: audioSetup$(service).pipe(
        tap((e) => {
          if (e.value === "resume") {
            this.$router.push({ path: Routes.Listen });
          }
        }),
        map((e) => {
          console.log(e.value);
          switch (e.value) {
            case "detectingAudio":
              return { title: "Initializing", status: "Detecting microphone" };
            case "createAudioAnalyzer":
              return { title: "Initializing", message: "Loading analyzers" };
            case "noAudioFound":
              return { title: "No microphone found" };
            default:
              return { title: e.value, message: e.context.message };
          }
        })
      ),
    };
  },
});
</script>
