<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <h1 class="display-4">{{ note$ }}</h1>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mergeMap } from "rxjs/operators";
import { audio$, audioService } from "@/lib/audio";
import { ActiveNoteState } from "../lib/audio/analysis/activeNoteService";
import { AudioState } from "../lib/audio/audioService";
import { of, Observable } from "rxjs";
import { Note } from "../lib/audio/analysis";

export default Vue.extend({
  name: "NoteViz",

  components: {},

  // created() {
  //   this.audioService.onTransition(state => {
  //     // this.current;

  //     const runningState = this.audioService.children.get("running");
  //     if (runningState) {
  //       switch (runningState.state.value) {
  //         case "running": {
  //           console.log("activeNote", runningState.state.context);
  //           this.note$ = runningState.state.context.note$;
  //         }
  //       }
  //     }
  //     // if (runningState) {
  //     //   switch ((runningState as ActiveNoteState).value) {
  //     //     case 'waiting' {

  //     //     }
  //     //   }
  //     // }
  //   });
  // },

  data() {
    return {
      audioService
    };
  },

  subscriptions: function(this) {
    return {
      note$: audio$.pipe(
        mergeMap<AudioState, Observable<Note | undefined>>(e => {
          if (e.value === "running") {
            const service = audioService.children.get("running");

            if (service) {
              const state = service.state as ActiveNoteState;
              switch (state.value) {
                case "running":
                  return state.context.note$!;
              }
            }
          }

          return of(undefined);
        })
      )
    };
  }
});
</script>
