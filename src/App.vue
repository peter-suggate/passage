<template>
  <v-app id="scrollarea">
    <v-main>
      <div
        v-for="(component, index) in activePageComponentNames"
        :key="component"
        v-bind:style="pageStyles$[index]"
      >
        <component :is="component" :appService="appService"></component>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import {
  layoutViews,
  LayoutConfig,
  appLayouts,
  pageStyles$
} from "@/layouts/appLayouts";
import { makeAppService, AppService, makeApp$, AppState } from "./appService";

export default Vue.extend({
  name: "App",

  data: () =>
    ({
      observer: undefined,
      activePages: appLayouts({ value: "uninitialized", context: {} }),
      appService: makeAppService()
    } as {
      observer: undefined | IntersectionObserver;
      activePages: LayoutConfig[];
      appService: AppService;
    }),

  computed: {
    activePageComponentNames: function() {
      return this.activePages.map(page => page.component);
    }
  },

  components: {
    ...layoutViews
  },

  subscriptions: function(this) {
    const appService: AppService = this.$data.appService;

    const app$ = makeApp$(appService);

    return {
      app$,
      pageStyles$: pageStyles$(app$)
    };
  },

  created: function(this) {
    const appService: AppService = this.appService;

    appService.onTransition(state => {
      this.activePages = appLayouts(state as AppState);
    });
  }
});
</script>
