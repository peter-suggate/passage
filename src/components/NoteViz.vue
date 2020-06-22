<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <v-col v-if="note$">
            <h1 class="display-4">{{ note$.value }}</h1>
            <h1 class="display-1">octave: {{ note$.octave }}</h1>
            <h1 class="display-1">cents: {{ Math.round(note$.cents) }}</h1>
            <h1 class="display-2">clarity: {{ note$.clarity.toFixed(1) }}</h1>
            <h1 class="display-2">age: {{ note$.age }}</h1>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mergeMap } from "rxjs/operators";
import { audio$, audioService } from "@/lib/audio";
import {
  ActiveNoteState,
  NoteInfo
} from "../lib/audio/analysis/activeNoteService";
import { AudioState } from "../lib/audio/audioService";
import { of, Observable } from "rxjs";

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
        mergeMap<AudioState, Observable<NoteInfo | undefined>>(e => {
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
