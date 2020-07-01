<template>
  <div class="listen">
    <v-container id="triggerListen">
      <v-row class="text-center">
        <v-col class="mb-4">
          <NoteViz style="height: 60vh" />
          <br />
          <v-btn v-on:click="finished">Finished</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import Vue from "vue";
import { audioService } from "../lib/audio";
import { redirect } from "../router";
import NoteViz from "@/components/NoteViz.vue";

export default Vue.extend({
  name: "ListenView",

  components: {
    NoteViz,
  },

  data: () =>
    ({
      observer: undefined,
    } as {
      observer: undefined | IntersectionObserver;
    }),

  mounted() {
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          audioService.send("RESUME");
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0.5,
    });

    const target = document.querySelector("#triggerListen");
    if (target) this.observer.observe(target);
  },

  methods: {
    finished: function() {
      audioService.send("STOP");
    },
  },

  // subscriptions: function(this) {
  //   return {
  //     isStopping$: audio$.pipe(
  //       tap(e => {
  //         if (e.value === "transitionRunningToSuspended") {
  //           animateTransition(PRIMARY_ACTION_ELEM_ID);
  //         }
  //       }),
  //       map(e => e.value === "transitionRunningToSuspended")
  //     )
  //   };
  // },

  beforeRouteEnter(to, from, next) {
    redirect(next);
  },
});
</script>
