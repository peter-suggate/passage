<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <v-col v-if="note$">
            <h1 class="display-4">{{ note$.value }}</h1>
            <h2 class="display-1">octave: {{ note$.octave }}</h2>
            <h2 class="display-1">cents: {{ Math.round(note$.cents) }}</h2>
            <h2 class="display-1">clarity: {{ note$.clarity.toFixed(2) }}</h2>
            <h2 class="display-1">age: {{ note$.age.toFixed(2) }}</h2>
            <h2
              class="display-1"
            >average quality: {{ averageQuality$ ? averageQuality$.toFixed(2) : '' }}</h2>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { ListenService } from "../listenService";

type Props = {
  service: ListenService;
};

export default Vue.extend({
  name: "ActiveNote",

  props: {
    service: Object
  },

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
  //     //   switch ((runningState as ListenState).value) {
  //     //     case 'waiting' {

  //     //     }
  //     //   }
  //     // }
  //   });
  // },

  created() {
    // const { state, interpreter } = useService(
    //   audioService.children.get("running")
    // );
    // interpreter
    //   .onTransition((state) => console.log("PRODUCT TRANSITION", state))
    //   .onEvent((event) => console.log("PRODUCT EVENT", event));
  },

  subscriptions: function(this) {
    const service: ListenService = this.$props.service;

    return {
      note$: service.state.context.observables.note$,
      averageQuality$: service.state.context.observables.averageQuality$
    };
  }
});
</script>
