<template>
  <v-container fluid style="height: 100%">
    <v-row align="center" justify="center" style="height: 100%">
      <v-col id="triggerSetup">
        <v-row>
          <SetupStatus v-if="!setupService" :service="$props.appService" />
          <SetupAudio v-if="setupService" :service="setupService" />
        </v-row>
        <v-row v-if="setupComplete" align="center" justify="center">
          <v-btn v-bind:style="buttonStyle$" v-on:click="listen" justify="center">Start</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { AppService, AppState } from "@/appService";
import SetupAudio from "./components/SetupAudio.vue";
import SetupStatus from "./components/SetupStatus.vue";
import {
  pageScrollY$,
  opacityFadeout,
  fraction
} from "@/layouts/page-transforms";
import { map } from "rxjs/operators";
import { AudioSetupService } from "./audioSetupService";
import { navigateToActivePage } from "../../layouts/navigateToActivePage";

export default Vue.extend({
  name: "SetupView",

  props: {
    appService: Object
  },

  components: {
    SetupAudio,
    SetupStatus
  },

  data: () =>
    ({
      observer: undefined,
      setupService: undefined,
      setupComplete: false
    } as {
      observer: undefined | IntersectionObserver;
      setupService: undefined | AudioSetupService;
      setupComplete: boolean;
    }),

  mounted() {
    const callback: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.$props.appService.send("START");
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5
    });

    const target = document.querySelector("#triggerSetup");
    if (target) this.observer.observe(target);
  },

  created() {
    const appService: AppService = this.$props.appService;

    appService.onTransition(s => {
      const state = s as AppState;
      if (state.value === "setupAudio") {
        this.setupService = appService.children.get(
          "audioSetup"
        ) as AudioSetupService;
      } else {
        this.setupService = undefined;
      }

      if (state.value === "running" || state.value === "suspended") {
        this.setupComplete = true;
      }
    });
  },

  subscriptions: function(this) {
    const pageIndex = 1;
    return {
      // setupService$: audio$.pipe(
      //   map(e =>
      //     e.value === "setupAudio"
      //       ? appService.children.get("audioSetup")
      //       : undefined
      //   )
      // ),
      // setupComplete$: audio$.pipe(
      //   map(e => e.value === "suspended" || e.value === "running")
      // ),
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
      const appService: AppService = this.$props.appService;

      appService.send("RESUME");

      navigateToActivePage(appService);
    }
  }
});
</script>
