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
        <v-btn :to="`${Routes.Setup}`">Begin Practice</v-btn>

        <!-- <p class="subheading font-weight-regular">
          For help and collaboration with other Vuetify developers,
          <br />please join our online
          <a href="https://community.vuetifyjs.com" target="_blank"
            >Discord Community</a
          >
        </p>-->
      </v-col>

      <!-- <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">
          What's next?
        </h2>

        <v-row justify="center">
          <a
            v-for="(next, i) in whatsNext"
            :key="i"
            :href="next.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ next.text }}
          </a>
        </v-row>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">
          Important Links
        </h2>

        <v-row justify="center">
          <a
            v-for="(link, i) in importantLinks"
            :key="i"
            :href="link.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ link.text }}
          </a>
        </v-row>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-3">
          Ecosystem
        </h2>

        <v-row justify="center">
          <a
            v-for="(eco, i) in ecosystem"
            :key="i"
            :href="eco.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ eco.text }}
          </a>
        </v-row>
      </v-col>-->
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Logo from "@/components/general/Logo.vue";
import { Routes } from "@/router/Routes";

export default Vue.extend({
  name: "HelloWorld",

  components: {
    Logo
  },

  data: () => ({
    Routes
  })
});
</script>
