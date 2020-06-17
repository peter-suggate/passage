<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <Logo />
        </v-row>
      </v-col>

      <v-col class="mb-4">
        <br />
        <v-btn v-on:click="begin">Begin Practice</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Logo from "@/components/general/Logo.vue";
import { Routes } from "@/router/Routes";
import { audioService } from "@/lib/audio";

export default Vue.extend({
  name: "HelloWorld",

  components: {
    Logo
  },

  data: () => ({
    Routes
  }),

  methods: {
    begin: function() {
      audioService.send("START");
    }
  }
});
</script>
