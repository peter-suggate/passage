<template>
  <v-container fluid style="height: 100%">
    <v-row align="center" justify="center" style="height: 100%">
      <v-col>
        <v-spacer />
        <v-row v-if="setupSynthService">
          <ConfigureSynth :service="setupSynthService" @onStart="onStart" @onCancel="onCancel" />
        </v-row>
        <v-row align="center" justify="center" id="triggerFinished">
          <v-btn v-bind:style="buttonStyle$" v-on:click="onStart" justify="center">Finished</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ConfigureSynth from "./components/ConfigureSynth.vue";
import {
  pageScrollY$,
  opacityFadeout,
  fraction
} from "@/layouts/page-transforms";
import { navigateToActivePage } from "@/layouts/navigateToActivePage";
import { map } from "rxjs/operators";
import { AppService } from "../../appService";
import { SetupSynthService } from "./setupSynthesizerMachine";

export default Vue.extend({
  name: "SetupSynthView",

  components: {
    ConfigureSynth
  },

  props: {
    appService: Object
  },

  data: () =>
    ({
      observer: undefined,
      setupSynthService: undefined
    } as {
      observer: undefined | IntersectionObserver;
      setupSynthService: undefined | SetupSynthService;
    }),

  created() {
    const appService: AppService = this.$props.appService;

    appService.onTransition(state => {
      if (state.value === "setupSynthesizer") {
        this.setupSynthService = appService.children.get(
          "setupSynthesizer"
        ) as SetupSynthService;
      } else {
        this.setupSynthService = undefined;
      }
    });
  },

  mounted() {
    const appService: AppService = this.$props.appService;

    const callback: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          appService.send("START");
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
    onStart: function() {
      const appService: AppService = this.$props.appService;

      appService.send("RESUME");

      navigateToActivePage(appService);
    },

    onCancel: function() {
      const appService: AppService = this.$props.appService;

      appService.send("USE_AUDIO");

      navigateToActivePage(appService);
    }
  }
});
</script>
