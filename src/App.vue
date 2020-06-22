<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h1 class="display-1 font-weight-light mb-3">Passage</h1>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import gsap from "gsap";
import { tap } from "rxjs/operators";
import { audio$, audioService } from "@/lib/audio";
import { redirectOnAudioServiceStateChange$, redirect } from "./router";

export default Vue.extend({
  name: "App",

  components: {},

  data: () => ({
    //
  }),

  subscriptions: function(this) {
    return { $: redirectOnAudioServiceStateChange$(this) };
  },

  beforeRouteEnter(to, from, next) {
    redirect(next);
  },
});
</script>
