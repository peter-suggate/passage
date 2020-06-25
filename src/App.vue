<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h1 class="display-1 font-weight-light mb-3">Passage</h1>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <Begin style="height: 80vh" />

      <Setup style="height: 80vh" />

      <div id="divAsTarget">
        <h3>Loading ...</h3>
      </div>

      <Listen style="height: 80vh" />
      <!-- <router-view></router-view> -->
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import gsap from "gsap";
import { tap, map } from "rxjs/operators";
import { audio$, audioService } from "@/lib/audio";
import { redirectOnAudioServiceStateChange$, redirect } from "./router";
import HelloWorld from "@/components/HelloWorld.vue";
import SetupAudioVue from "./components/SetupAudio.vue";
import ListenVue from "./components/NoteViz.vue";

// function style$() {
//   return audio$.pipe(
//     map(e => {
//       switch (e.value) {
//         case "uninitialized": {
//           return {
//             top: 0,
//             height: "100vh"
//           };
//         }
//         case "transitionUninitializedToSetup": {
//           return {
//             top: 0,
//             height: "200vh"
//           };
//         }
//         default:
//         case "running": {
//           return {
//             top: 0,
//             height: "300vh"
//           };
//         }
//       }
//     })
//   );
// }

export default Vue.extend({
  name: "App",

  components: {
    Begin: HelloWorld,
    Setup: SetupAudioVue,
    Listen: ListenVue
  },

  data: () =>
    ({
      observer: undefined
    } as { observer: undefined | IntersectionObserver }),

  subscriptions: function(this) {
    return {
      $: redirectOnAudioServiceStateChange$(this)
      // scrollWrapperStyle$: style$()
    };
  },

  beforeRouteEnter(to, from, next) {
    redirect(next);
  },

  mounted() {
    const callback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log("entry.intersectionRatio", entry.intersectionRatio);
          if (audioService.state.value === "uninitialized")
            audioService.send("START");
          // this.fetchUsers();
        }
      });
    };

    this.observer = new IntersectionObserver(callback, {
      root: null,
      threshold: 0
    });

    const target = document.querySelector("#divAsTarget");
    if (target) this.observer.observe(target);
  }
});
</script>
