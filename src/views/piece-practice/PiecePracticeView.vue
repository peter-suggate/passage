<template>
  <div class="listen">
    <v-container id="triggerListen">
      <v-row class="text-center">
        <v-col v-if="piecePracticeService" class="mb-4">
          <ActiveNote style="height: 40vh" :service="piecePracticeService" />
          <br />
          <v-btn v-on:click="finished">Finished</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ActiveNote from "./components/ActiveNote.vue";
import NoteHistory from "./components/NoteHistory.vue";
import ClosestMatches from "./components/ClosestMatches.vue";
import { ListenService } from "../listen/listenService";
import { PiecePracticeService } from "./piecePracticeService";

export default Vue.extend({
  name: "ListenView",

  props: {
    appService: Object
  },

  components: {
    ActiveNote
  },

  data: () =>
    ({
      observer: undefined,
      piecePracticeService: undefined
    } as {
      observer: undefined | IntersectionObserver;
      piecePracticeService: undefined | PiecePracticeService;
    }),

  created() {
    const listenService: ListenService = this.$props.listenService;

    listenService.onTransition(state => {
      switch (state.value) {
        case "running":
          this.piecePracticeService = (appService.children.get(
            "running"
          ) as unknown) as ListenService;
          break;
        default:
          this.listenService = undefined;
          break;
      }
    });
  },

  mounted() {
    const appService: AppService = this.$props.appService;

    const callback: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          appService.send("RESUME");
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5
    });

    const target = document.querySelector("#triggerListen");
    if (target) this.observer.observe(target);
  },

  methods: {
    finished: function() {
      const appService: AppService = this.$props.appService;

      appService.send("STOP");
    }
  }
});
</script>
