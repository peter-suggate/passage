<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <h1 class="display-3">{{ status.message }}</h1>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { map } from "rxjs/operators";
import { audio$, audioService } from "@/lib/audio";
import { ActiveNoteState } from "../lib/audio/analysis/activeNoteService";

export default Vue.extend({
  name: "NoteViz",

  components: {},

  data: () => ({}),

  subscriptions: function(this) {
    // const service = audioSetupService();

    // service.send("DETECT");

    return {
      status: audio$.pipe(
        map(e => {
          if (e.value === "running") {
            const service = audioService.children.get("running");

            if (service) {
              const state = service.state as ActiveNoteState;

              switch (state.value) {
                case "uninitialized":
                case "waiting":
                  return {
                    message: "Can't hear a tune"
                  };
                case "noteActive":
                  return {
                    message: state.context.note
                  };
              }
            }
          }

          return {
            title: "Error",
            message: "Shouldn't ever get here"
          };
          // console.log(e.value);
          // switch (e.value) {
          // }
        })
      )
    };
  }
});
</script>
