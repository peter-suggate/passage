<template>
  <div class="listen">
    <v-container id="triggerListen">
      <v-row class="text-center">
        <v-col v-if="pieceService" class="mb-4">
          <ActiveNote style="height: 40vh" :service="pieceService" />
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
import { SessionService } from "../session/sessionService";
import { PieceService } from "./pieceService";

export default Vue.extend({
  name: "SessionView",

  props: {
    appService: Object,
  },

  components: {
    ActiveNote,
  },

  data: () =>
    ({
      observer: undefined,
      pieceService: undefined,
    } as {
      observer: undefined | IntersectionObserver;
      pieceService: undefined | PieceService;
    }),

  created() {
    const sessionService: SessionService = this.$props.sessionService;

    // sessionService.onTransition(state => {
    //   switch (state.value) {
    //     case "running":
    //       this.pieceService = (appService.children.get(
    //         "running"
    //       ) as unknown) as SessionService;
    //       break;
    //     default:
    //       this.sessionService = undefined;
    //       break;
    //   }
    // });
  },

  mounted() {
    // const appService: AppService = this.$props.appService;
    // const callback: IntersectionObserverCallback = entries => {
    //   entries.forEach(entry => {
    //     if (entry.isIntersecting) {
    //       appService.send("RESUME");
    //     }
    //   });
    // };
    // this.observer = new IntersectionObserver(callback, {
    //   root: null,
    //   threshold: 0.5
    // });
    // const target = document.querySelector("#triggerListen");
    // if (target) this.observer.observe(target);
  },

  methods: {
    finished: function () {
      // const appService: AppService = this.$props.appService;
      // appService.send("STOP");
    },
  },
});
</script>
