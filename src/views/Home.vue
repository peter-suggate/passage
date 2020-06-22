<template>
  <div class="home">
    <v-row class="text-center">
      <v-col cols="12">
        <v-row justify="center">
          <div :id="VIEW_ELEM_ID">
            <HelloWorld />
            <br />
          </div>
        </v-row>
        <v-col class="mb-4">
          <v-btn :id="PRIMARY_ACTION_ELEM_ID" v-on:click="begin"
            >Begin Practice</v-btn
          >
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import { audioService } from "@/lib/audio";
import {
  VIEW_ELEM_ID,
  PRIMARY_ACTION_ELEM_ID,
  animateTransitions,
} from "../transitions";

export default {
  name: "Home",

  components: {
    HelloWorld,
  },

  data: () => ({
    VIEW_ELEM_ID,
    PRIMARY_ACTION_ELEM_ID,
  }),

  mounted() {
    animateTransitions([VIEW_ELEM_ID]);
  },

  methods: {
    begin: function() {
      audioService.send("START");
    },
  },
};
</script>
