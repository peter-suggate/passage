<template>
  <!-- <v-container class="setup" style="height: 100%"> -->
  <!-- <div style="height: 30vh" /> -->
  <v-container fluid style="height: 100%">
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="center">
          <div id="triggerSetup">
            <SetupAudio />
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <!-- <v-row style="height: 100%">
    <v-col>
      <v-spacer />
      <v-col justify="center">
        <div id="triggerSetup">
          <SetupAudio />
        </div>
      </v-col>
      <v-spacer />
    </v-col>
  </v-row> -->
</template>

<script lang="ts">
import Vue from "vue";
import SetupAudio from "@/components/SetupAudio.vue";
import { audioService } from "../lib/audio";

export default Vue.extend({
  name: "SetupView",

  components: {
    SetupAudio,
  },

  data: () =>
    ({
      observer: undefined,
      // activePages: appPageConfigs.uninitialized
    } as {
      observer: undefined | IntersectionObserver;
      // activePages: PageConfig[];
      // componentNames: (keyof PageComponents)[];
    }),

  mounted() {
    const callback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          audioService.send("START");
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0,
    });

    const target = document.querySelector("#triggerSetup");
    if (target) this.observer.observe(target);
  },

  // beforeRouteEnter(to, from, next) {
  //   redirect(next);
  // }
});
</script>
