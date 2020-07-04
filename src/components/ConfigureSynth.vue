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
          <v-btn v-on:click="listen">Generate</v-btn>
        </v-sheet>
        <v-btn v-if="status$.settingUp" v-on:click="cancel">Cancel</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { map } from "rxjs/operators";
import { audio$, audioService } from "../lib/audio";
import { instruments, instrumentName } from "../lib/audio/synth/synth-types";
import { pageHeight } from "../transitions/page-transforms";

export default Vue.extend({
  name: "ConfigureSynth",

  data: () => ({
    instrument: instruments[0],
    instruments: instruments.map(id => ({ id, label: instrumentName(id) }))
  }),

  methods: {
    listen: function() {
      audioService.send("RESUME");

      window.scrollBy({
        top: pageHeight(),
        behavior: "smooth"
      });
    },
    cancel: function() {
      audioService.send("STOP");

      window.scroll({
        top: 0,
        behavior: "smooth"
      });
    }
  },

  subscriptions: function(this) {
    return {
      status$: audio$.pipe(
        map(e => {
          switch (e.value) {
            case "uninitialized":
            case "error":
              return {
                title: `Error: ${e.context.message}`,
                error: true,
                settingUp: false
              };
            case "setupSynthesizer":
            default: {
              return {
                title: "Configure synthesizer",
                error: false,
                setup: e.context
              };
            }
          }
        })
      )
    };
  }
});
</script>
