<template>
  <div class="setup">
    <v-col cols="12">
      <div :id="VIEW_ELEM_ID" />
      <v-col justify="center">
        <div><SetupAudio /></div>
      </v-col>
    </v-col>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SetupAudio from "@/components/SetupAudio.vue";
import { redirect } from "../router";
import {
  VIEW_ELEM_ID,
  PRIMARY_ACTION_ELEM_ID,
  animateTransitions,
} from "../transitions/constants";

export default Vue.extend({
  name: "Home",

  components: {
    SetupAudio,
  },

  data: () => ({
    PRIMARY_ACTION_ELEM_ID,
    VIEW_ELEM_ID,
  }),

  mounted() {
    animateTransitions([PRIMARY_ACTION_ELEM_ID, VIEW_ELEM_ID]);
  },

  methods: {
    // cancel: function() {
    //   // audioService.send("START");
    // },
  },

  beforeRouteEnter(to, from, next) {
    redirect(next);
  },
});
</script>
