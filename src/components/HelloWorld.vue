<template>
  <v-container>
    <Logo />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Logo from "@/components/general/Logo.vue";
import { Routes } from "@/router/Routes";

export default Vue.extend({
  name: "HelloWorld",

  components: {
    Logo,
  },

  data: () => ({
    Routes,
  }),
});
</script>
