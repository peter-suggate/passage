<template>
  <div class="listen">
    <v-container>
      <v-row class="text-center">
        <v-col class="mb-4">
          <br />
          <v-btn v-on:click="finished">Finished</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import Vue from "vue";
import { audioService } from "../lib/audio";
import { redirect } from "../router";
// import HelloWorld from "@/components/HelloWorld.vue";

export default Vue.extend({
  name: "Home",
  components: {
    // HelloWorld
  },
  methods: {
    finished: function() {
      audioService.send("STOP");
    }
  },
  beforeRouteEnter(to, from, next) {
    redirect(next);
  }
});
</script>
