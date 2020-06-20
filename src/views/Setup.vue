<template>
  <div class="setup">
    <SetupAudio />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SetupAudio from "@/components/SetupAudio.vue";
import { redirect } from "../router";

export default Vue.extend({
  name: "Home",

  components: {
    SetupAudio
  },

  beforeRouteEnter(to, from, next) {
    redirect(next);
  }
});
</script>
