<template>
  <div class="listen">
    <v-container id="triggerListen">
      <v-row class="text-center">
        <v-col v-if="listenService" class="mb-4">
          <ActiveNote style="height: 40vh" :service="listenService" />
          <NoteHistory style="height: 20vh" :service="listenService" />
          <ClosestMatches style="height: 20vh" :service="listenService" />
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
import { AppService } from "../../appService";
import { ListenService } from "./listenService";

export default Vue.extend({
  name: "ListenView",

  props: {
    appService: Object
  },

  components: {
    ActiveNote,
    NoteHistory,
    ClosestMatches
  },

  data: () =>
    ({
      observer: undefined,
      listenService: undefined
    } as {
      observer: undefined | IntersectionObserver;
      listenService: undefined | ListenService;
    }),

  created() {
    const appService: AppService = this.$props.appService;

    appService.onTransition(state => {
      switch (state.value) {
        case "running":
          this.listenService = (appService.children.get(
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
