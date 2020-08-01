<template>
  <v-container>
    <v-row class="text-center fit-content" align="center" justify="center">
      <v-col cols="12" sm="10" md="6" lg="5">
        <v-row class="row" align="center" justify="center">
          <v-icon style="font-size: 6rem;">{{status.icon}}</v-icon>
        </v-row>
        <transition name="fade">
          <v-row class="row" justify="center">
            <v-col>
              <br />
              <h1 class="h1">{{ status.title }}</h1>
              <p>{{ status.message }}</p>
            </v-col>
          </v-row>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.row {
  min-height: 15vh;
}

.fit-content {
  height: fit-content;
}
</style>

<script lang="ts">
import { useService } from "@xstate/vue";
import { AudioSetupService, AudioSetupState } from "../audioSetupService";
import { ref } from "@vue/composition-api";

type Status = {
  icon:
    | "mdi-spin mdi-loading"
    | "mdi-microphone"
    | "mdi-microphone-off"
    | "mdi-microphone-outline";
  title: string;
  message: string;
  cancellable: boolean;
  retryable: boolean;
};

const statusFromState = (state: AudioSetupState): Status => {
  switch (state.value) {
    case "noAudioFound":
      return {
        icon: "mdi-microphone-off",
        title: "No microphone",
        message:
          state.context.message || "Audio recorder not available or allowed",
        cancellable: false,
        retryable: true
      };
    case "cancelled":
      return {
        icon: "mdi-microphone-off",
        title: "Cancelled",
        message: "",
        cancellable: false,
        retryable: true
      };
    case "detectingAudio":
    case "createAudioAnalyzer":
      return {
        icon: "mdi-spin mdi-loading",
        title: "Detecting...",
        message: "",
        cancellable: true,
        retryable: false
      };
    case "analyzerCreated":
      return {
        icon: "mdi-microphone",
        title: "Ready",
        message: "Microphone found",
        cancellable: false,
        retryable: false
      };
    case "analyzerError":
      return {
        icon: "mdi-microphone-off",
        title: "Error",
        message:
          state.context.message ||
          "Unknown error occurred finding recording device. Check you have a working microphone and it is enabled for this website in your browser settings.",
        cancellable: false,
        retryable: true
      };
  }
};

type Props = {
  service: AudioSetupService;
};

export default {
  props: {
    service: Object
  },

  setup(propsUnknown: unknown) {
    const props = propsUnknown as Props;

    const { state, send, service } = useService(
      props.service as AudioSetupService
    );

    const status = ref(statusFromState(state.value as AudioSetupState));

    service.value.onTransition(e => {
      // console.warn("transition", e.value, e.context.message);
      status.value = statusFromState(e as AudioSetupState);
    });

    return {
      send,
      status
    };
  }
};
</script>
