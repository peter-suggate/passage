<template>
  <v-app id="scrollarea">
    <!-- <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h1 class="display-1 font-weight-light mb-3">Passage</h1>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>-->

    <v-main>
      <div
        v-for="(component, index) in activePageComponentNames"
        :key="component"
        v-bind:style="pageStyles$[index]"
      >
        <component :is="component"></component>
      </div>
      <!-- <router-view></router-view> -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import {
  pageComponents,
  PageConfig,
  appPageConfigs,
  pageStyles$,
} from "@/transitions/page-transforms";
import { audioService } from "./lib/audio";
import { AudioValidStates } from "./lib/audio/audioService";

export default Vue.extend({
  name: "App",

  data: () =>
    ({
      observer: undefined,
      activePages: appPageConfigs.uninitialized,
    } as {
      observer: undefined | IntersectionObserver;
      activePages: PageConfig[];
    }),

  computed: {
    activePageComponentNames: function() {
      return this.activePages.map((page) => page.component);
    },
  },

  components: {
    ...pageComponents,
  },

  subscriptions: function(this) {
    return {
      pageStyles$: pageStyles$(),
      // $: redirectOnAudioServiceStateChange$(this),
    };
  },

  // beforeRouteEnter(to, from, next) {
  //   redirect(next);
  // },

  created: function(this) {
    audioService.onTransition((state) => {
      this.activePages = appPageConfigs[state.value as AudioValidStates];
    });
  },

  // mounted() {
  //   const callback: IntersectionObserverCallback = (entries, observer) => {
  //     entries.forEach(entry => {
  //       if (entry.isIntersecting) {
  //         console.log("entry.intersectionRatio", entry.intersectionRatio);
  //         if (audioService.state.value === "uninitialized")
  //           audioService.send("START");
  //         // this.fetchUsers();
  //       }
  //     });
  //   };

  //   this.observer = new IntersectionObserver(callback, {
  //     root: null,
  //     threshold: 0
  //   });

  //   const target = document.querySelector("#divAsTarget");
  //   if (target) this.observer.observe(target);
  // }
});
</script>
