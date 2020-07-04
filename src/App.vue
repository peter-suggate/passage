<template>
  <v-app id="scrollarea">
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
  appPageConfig,
  pageStyles$
} from "@/transitions/page-transforms";
import { audioService } from "./lib/audio";
import { AudioValidStates, AudioState } from "./lib/audio/audioService";

export default Vue.extend({
  name: "App",

  data: () =>
    ({
      observer: undefined,
      activePages: appPageConfig({ value: "uninitialized", context: {} })
    } as {
      observer: undefined | IntersectionObserver;
      activePages: PageConfig[];
    }),

  computed: {
    activePageComponentNames: function() {
      return this.activePages.map(page => page.component);
    }
  },

  components: {
    ...pageComponents
  },

  subscriptions: function(this) {
    return {
      pageStyles$: pageStyles$()
      // $: redirectOnAudioServiceStateChange$(this),
    };
  },

  // beforeRouteEnter(to, from, next) {
  //   redirect(next);
  // },

  created: function(this) {
    audioService.onTransition(state => {
      this.activePages = appPageConfig(state as AudioState);
    });
  }
});
</script>
