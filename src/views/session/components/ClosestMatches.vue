<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <div v-for="(match, index) in closestMatchingPieces$" :key="index">
            <h1 class="display-1">{{ match.piece.name }}</h1>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { SessionService } from "../sessionService";

type Props = {
  service: SessionService;
};

export default Vue.extend({
  name: "NoteHistory",

  props: {
    service: Object,
  },

  subscriptions: function (this) {
    const service: SessionService = this.$props.service;

    return {
      closestMatchingPieces$:
        service.state.context.observables.closestMatchingPieces$,
    };
  },
});
</script>
