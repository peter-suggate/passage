<template>
  <v-row justify="center">
    <v-icon style="font-size: 80px;"
      >mdi-arrow-right-drop-circle-outline</v-icon
    >
    <span class="mb-1">crush</span>
    <span class="display-3 font-weight-bold">
      Passage
    </span>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Logo",

  props: {
    size: String,
  },
});
</script>
