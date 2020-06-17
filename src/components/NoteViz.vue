<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <h1 class="display-3">{{ note }}</h1>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { activeNote$ } from "@/lib/audio/analysis";

export default Vue.extend({
  name: "NoteViz",

  components: {},

  data: () => ({}),

  subscriptions: function(this) {
    // const service = audioSetupService();

    // service.send("DETECT");

    return {
      // note: activeNote$()
      // status: audioSetup$(service).pipe(
      //   tap((e) => {
      //     if (e.value === "resume") {
      //       this.$router.push({ path: Routes.Listen });
      //     }
      //   }),
      //   map((e) => {
      //     console.log(e.value);
      //     switch (e.value) {
      //       case "detectingAudio":
      //         return { title: "Initializing", status: "Detecting microphone" };
      //       case "createAudioAnalyzer":
      //         return { title: "Initializing", message: "Loading analyzers" };
      //       case "noAudioFound":
      //         return { title: "No microphone found" };
      //       default:
      //         return { title: e.value, message: e.context.message };
      //     }
      //   })
      // ),
    };
  },
});
</script>
