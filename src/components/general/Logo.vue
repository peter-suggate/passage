<template>
  <v-row justify="center">
    <v-icon style="font-size: 6rem;">mdi-fast-forward-outline</v-icon>
    <span class="display-3 font-weight-bold">Passage</span>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Logo",

  props: {
    size: String
  }
});
</script>
