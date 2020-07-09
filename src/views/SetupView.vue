<template>
  <v-container fluid style="height: 100%">
    <v-row align="center" justify="center" style="height: 100%">
      <v-col id="triggerSetup">
        <v-row>
          <SetupStatus v-if="!setupService$" />
          <SetupAudio v-if="setupService$" :service="setupService$" />
        </v-row>
        <v-row v-if="setupComplete$" align="center" justify="center">
          <v-btn
            v-bind:style="buttonStyle$"
            v-on:click="listen"
            justify="center"
            >Start</v-btn
          >
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import SetupAudio from "@/components/SetupAudio.vue";
import SetupStatus from "@/components/SetupStatus.vue";
import { audioService, audio$ } from "../lib/audio";
import {
  pageScrollY$,
  opacityFadeout,
  fraction,
  pageTop,
  pageIndexForState,
} from "../transitions/page-transforms";
import { map } from "rxjs/operators";
import { AudioState } from "../lib/audio/audioService";

export default Vue.extend({
  name: "SetupView",

  components: {
    SetupAudio,
    SetupStatus,
  },

  data: () =>
    ({
      observer: undefined,
    } as {
      observer: undefined | IntersectionObserver;
    }),

  mounted() {
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          audioService.send("START");
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5,
    });

    const target = document.querySelector("#triggerSetup");
    if (target) this.observer.observe(target);
  },

  subscriptions: function(this) {
    const pageIndex = 1;
    return {
      setupService$: audio$.pipe(
        map((e) =>
          e.value === "setupAudio"
            ? audioService.children.get("audioSetup")
            : undefined
        )
      ),
      setupComplete$: audio$.pipe(
        map((e) => e.value === "suspended" || e.value === "running")
      ),
      buttonStyle$: pageScrollY$(pageIndex).pipe(
        map(({ scrollYRelPageFrac }) => ({
          // Fully hidden at 10% scroll.
          opacity: opacityFadeout(scrollYRelPageFrac, fraction(0.1)),

          willChange: "opacity",
        }))
      ),
    };
  },

  methods: {
    listen: function() {
      audioService.send("RESUME");

      window.scroll({
        top: pageTop(pageIndexForState(audioService.state as AudioState)),
        behavior: "smooth",
      });
    },
  },
});
</script>
