<template>
  <div class="home-view">
    <img
      src="/img/beethoven.svg"
      style="opacity: 0.15; position: absolute; width: 100%; max-height: 90vh; transform: translateY(5vh)"
    />
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <div v-bind:style="contentStyle$">
            <Home />
            <br />
          </div>
        </v-row>
        <v-col class="mb-4" v-bind:style="buttonStyle$">
          <v-btn v-on:click="begin">Begin Practice</v-btn>
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Home from "./components/Home.vue";
import { map } from "rxjs/operators";
import {
  fraction,
  offsetInPage,
  pageScrollY$,
  opacityFadeout,
  scrollKeepVisible
} from "@/layouts/page-transforms";
import { AppService } from "../../appService";
import { navigateToActivePage } from "../../layouts/navigateToActivePage";

export default Vue.extend({
  name: "HomeView",

  props: {
    appService: Object
  },

  components: {
    Home
  },

  subscriptions: function(this) {
    const pageIndex = 0;
    return {
      contentStyle$: pageScrollY$(pageIndex).pipe(
        map(({ scrollY, pageTopY, pageHeight, scrollYRelPageFrac }) => {
          if (scrollYRelPageFrac > 0.4) {
            return {
              position: "fixed",
              top: pageHeight * 0.05
            };
          } else {
            const offsetY = scrollKeepVisible(fraction(0.4), fraction(0.05))(
              scrollY,
              pageTopY,
              pageHeight
            );

            return {
              transform: `translateY(${offsetY}px)`,
              willChange: "transform"
            };
          }
        })
      ),
      buttonStyle$: pageScrollY$(pageIndex).pipe(
        map(({ scrollYRelPageFrac }) => ({
          // Fully hidden at 10% scroll.
          opacity: opacityFadeout(scrollYRelPageFrac, fraction(0.1)),

          // Position near middle of page.
          transform: offsetInPage(fraction(0.6)),

          willChange: "opacity"
        }))
      )
    };
  },

  methods: {
    begin: function() {
      const appService: AppService = this.$props.appService;

      appService.send("START");

      navigateToActivePage(appService);
    }
  }
});
</script>
