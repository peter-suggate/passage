<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <div v-for="(note, index) in recentDistinctNotes$" :key="index">
            <h1 class="display-1">{{ note.value }}</h1>
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
      recentDistinctNotes$:
        service.state.context.observables.recentDistinctNotes$,
    };
  },
});
</script>
