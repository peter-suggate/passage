<template>
  <v-container fluid style="height: 100%">
    <v-row align="center" justify="center" style="height: 100%">
      <v-col>
        <v-row align="center">
          <v-col>
            <v-btn v-on:click="back" justify="center" outlined color="secondary">
              <v-icon>mdi-chevron-double-left</v-icon>Back
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer />
        <v-row>
          <ConfigureSynth />
        </v-row>
        <v-row align="center" justify="center" id="triggerFinished">
          <v-btn v-bind:style="buttonStyle$" v-on:click="listen" justify="center">Finished</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ConfigureSynth from "@/components/ConfigureSynth.vue";
import { audioService, audio$ } from "../lib/audio";
import {
  pageScrollY$,
  opacityFadeout,
  fraction,
  pageTop,
  pageIndexForState
} from "../transitions/page-transforms";
import { map } from "rxjs/operators";
import { AudioState } from "../lib/audio/audioService";

export default Vue.extend({
  name: "ConfigureSynthView",

  components: {
    ConfigureSynth
  },

  data: () =>
    ({
      observer: undefined
    } as {
      observer: undefined | IntersectionObserver;
    }),

  mounted() {
    const callback: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          audioService.send("START");
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5
    });

    const target = document.querySelector("#triggerFinished");
    if (target) this.observer.observe(target);
  },

  subscriptions: function(this) {
    const pageIndex = 1;
    return {
      setupComplete$: audio$.pipe(
        map(e => e.value === "suspended" || e.value === "running")
      ),
      buttonStyle$: pageScrollY$(pageIndex).pipe(
        map(({ scrollYRelPageFrac }) => ({
          // Fully hidden at 10% scroll.
          opacity: opacityFadeout(scrollYRelPageFrac, fraction(0.1)),

          willChange: "opacity"
        }))
      )
    };
  },

  methods: {
    listen: function() {
      audioService.send("RESUME");

      window.scroll({
        top: pageTop(pageIndexForState(audioService.state as AudioState)),
        behavior: "smooth"
      });
    },

    back: function() {
      window.scroll({
        top: pageTop(pageIndexForState(audioService.state as AudioState) - 1),
        behavior: "smooth"
      });
    }
  }
});
</script>
