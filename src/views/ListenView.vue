<template>
  <div class="listen">
    <v-container>
      <v-row class="text-center">
        <v-col class="mb-4">
          <!-- <div v-if="!isStopping$"> -->
          <NoteViz :id="VIEW_ELEM_ID" style="height: 60vh" />
          <br />
          <v-btn :id="PRIMARY_ACTION_ELEM_ID" v-on:click="finished">Finished</v-btn>
          <!-- </div> -->
          <!-- <v-progress-circular
            v-if="isStopping$"
            :id="PRIMARY_ACTION_ELEM_ID"
            indeterminate
            color="primary"
          ></v-progress-circular>-->
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
import {
  // animateTransition,
  VIEW_ELEM_ID,
  PRIMARY_ACTION_ELEM_ID,
  animateTransitions
} from "../transitions/constants";
// import { map, tap } from "rxjs/operators";

export default Vue.extend({
  name: "ListenView",

  components: {
    NoteViz
  },

  data: () => ({
    PRIMARY_ACTION_ELEM_ID,
    VIEW_ELEM_ID
  }),

  methods: {
    finished: function() {
      audioService.send("STOP");
    }
  },

  mounted() {
    animateTransitions([VIEW_ELEM_ID]);
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
  }
});
</script>
