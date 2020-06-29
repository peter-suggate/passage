<template>
  <div class="setup">
    <div style="height: 30vh" />
    <v-col cols="12">
      <v-col justify="center">
        <div id="triggerSetup">
          <SetupAudio />
        </div>
        <!-- <div>
          <h3>Loading...</h3>
        </div> -->
        <div style="height: 30vh" />
      </v-col>
    </v-col>
  </div>
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
