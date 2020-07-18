<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col cols="12" sm="12" md="4">
        <v-sheet elevation="10" style="background: transparent; padding: 20px">
          <v-icon style="font-size: 6rem;">mdi-music-box-outline</v-icon>
          <v-radio-group v-model="instrument" column>
            <v-radio
              v-for="(instrument) in instruments"
              :key="instrument.id"
              :label="instrument.label"
              :value="instrument.id"
            />

            <!-- <v-radio :label="instrumentName()" value="bell"></v-radio>
            <v-radio label="Violin" value="violin"></v-radio>-->
          </v-radio-group>
          <v-row>
            <v-spacer />
            <v-btn v-on:click="listen">Start</v-btn>
            <v-spacer />
            <v-btn v-on:click="cancel">Cancel</v-btn>
            <v-spacer />
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { instruments, instrumentName } from "@/lib/audio/synth/synth-types";
import { SetupSynthService } from "../setupSynthesizerMachine";

// const statusFromState = (state: SetupSynthState): Status => {
//   switch (state.value) {
//     case "uninitialized":
//     case "error":
//       return {
//         title: `Error: ${e.context.message}`,
//         error: true,
//         settingUp: false
//       };
//     case "setupSynthesizer": {
//       const setupService = audioService.children.get("setupSynthesizer");
//       return {
//         title: "Configure synthesizer",
//         error: false,
//         setup: e.context,
//         setupService
//       };
//     }
//     default: {
//       return {
//         title: "Configure synthesizer",
//         error: false,
//         setup: e.context
//       };
//     }
//   }
// };

export default Vue.extend({
  name: "ConfigureSynth",

  props: {
    service: Object
  },

  data: () => ({
    instrument: instruments[0],
    instruments: instruments.map(id => ({ id, label: instrumentName(id) }))
  }),

  methods: {
    listen: function() {
      const service: SetupSynthService = this.$props.service;

      if (service) {
        service.send({ type: "FINISH" });
      }

      this.$emit("onStart");
    },
    cancel: function() {
      const service: SetupSynthService = this.$props.service;

      if (service) {
        service.send({ type: "CANCEL" });
      }

      this.$emit("onCancel");
    }
  }

  // subscriptions: function(this) {
  //   return {
  //     status$: audio$.pipe(
  //       map(e => {
  //         switch (e.value) {
  //           case "uninitialized":
  //           case "error":
  //             return {
  //               title: `Error: ${e.context.message}`,
  //               error: true,
  //               settingUp: false
  //             };
  //           case "setupSynthesizer": {
  //             const setupService = audioService.children.get(
  //               "setupSynthesizer"
  //             );
  //             return {
  //               title: "Configure synthesizer",
  //               error: false,
  //               setup: e.context,
  //               setupService
  //             };
  //           }
  //           default: {
  //             return {
  //               title: "Configure synthesizer",
  //               error: false,
  //               setup: e.context
  //             };
  //           }
  //         }
  //       })
  //     )
  //   };
  // }
});
</script>
