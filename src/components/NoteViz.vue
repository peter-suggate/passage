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
import { mergeMap, shareReplay, map } from "rxjs/operators";
import { audio$, audioService } from "@/lib/audio";
import {
  ActiveNoteState,
  NoteInfo,
  ActiveNoteContext,
} from "../lib/audio/analysis/activeNoteService";
import { AudioState } from "../lib/audio/audioService";
import { of, Observable, fromEventPattern } from "rxjs";
import { useService } from "@xstate/vue";
import { Interpreter } from "xstate";

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
      audioService,
    };
  },

  created() {
    // const { state, interpreter } = useService(
    //   audioService.children.get("running")
    // );
    // interpreter
    //   .onTransition((state) => console.log("PRODUCT TRANSITION", state))
    //   .onEvent((event) => console.log("PRODUCT EVENT", event));
  },

  subscriptions: function(this) {
    return {
      note$: audio$.pipe(
        mergeMap<AudioState, Observable<NoteInfo | undefined>>((e) => {
          if (e.value === "running") {
            const service = audioService.children.get("running");
            console.log("service", !!service);
            if (service) {
              return (service as Interpreter<ActiveNoteContext>).state.context
                .note$!;
              // const {  } = useService((service as Interpreter<ActiveNoteContext>));

              // return service$;
              // return fromEventPattern<AudioState>(
              //   (handler) => {
              //     (service as Interpreter<ActiveNoteContext>)
              //       // Listen for state transitions
              //       .onTransition((state, _) => handler(state))
              //       // Start the service
              //       .start();
              //     return service;
              //   },
              //   (_, service) => service.stop()
              // )
              //   .pipe(shareReplay(1))
              //   .pipe(
              //     map((state) => {
              //       if (state.value === "running") {
              //         return (state as ActiveNoteState).context.note$!;
              //       }
              //     })
              //   );
              // return Observable.create(service$);
              // service$.subscribe((v: any) => {
              //   console.log("listener service event:", v);
              // });
              // .onTransition((state: any) =>
              //   console.log("Listener transition", state)
              // )
              // .onEvent((event: any) => console.log("Listener EVENT", event));

              // const state = service.state as ActiveNoteState;
              // switch (state.value) {
              //   case "running":
              //     return state.context.note$!;
              // }
            }
          }

          return of(undefined);
        })
      ),
    };
  },
});
</script>
