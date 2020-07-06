<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col cols="12" sm="12" md="4">
        <v-icon style="font-size: 6rem;">mdi-microphone-outline</v-icon>
        <br />
        <h1 class="h1">{{ status$.title }}</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { map } from "rxjs/operators";
import { audio$ } from "../lib/audio";

export default Vue.extend({
  name: "SetupStatus",

  subscriptions: function(this) {
    return {
      status$: audio$.pipe(
        map(e => {
          switch (e.value) {
            case "uninitialized":
            case "setupStart": {
              return {
                title: "Audio setup",
                settingUp: true
              };
            }
            case "noWebAudio":
            case "error":
            case "setupSynthesizer":
              return {
                title: `${e.context.message}`,
                error: true,
                settingUp: false
              };
            case "resuming":
            case "running":
            default: {
              return {
                title: "Audio setup complete",
                error: false,
                settingUp: false
              };
            }
          }
        })
      )
    };
  }
});
</script>
