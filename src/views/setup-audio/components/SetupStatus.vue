<template>
  <v-container>
    <v-row class="text-center fit-content" align="center" justify="center">
      <v-col cols="12" sm="10" md="6" lg="5">
        <v-row class="row" align="center" justify="center">
          <v-icon style="font-size: 6rem;">{{ status.icon }}</v-icon>
        </v-row>
        <v-row class="row" align="center" justify="center">
          <v-col>
            <h1 class="h1">{{ status.title }}</h1>
            <br />
            <p>{{ status.message }}</p>
          </v-col>
        </v-row>
        <v-row class="row" align="center" justify="center">
          <v-btn
            class="ma-2"
            v-if="status.useAudio"
            @click="useAudio"
            color="primary"
            outlined
          >Use Audio</v-btn>
          <v-btn
            class="ma-2"
            v-if="status.retryable"
            @click="useSynthesizer"
            color="primary"
            outlined
          >Use synthesizer</v-btn>
          <v-btn class="ma-2" v-if="status.retryable" @click="send('RETRY')">Retry</v-btn>
        </v-row>
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
import { ref } from "@vue/composition-api";
import { useService } from "@xstate/vue";
import { AppState, AppService } from "@/appService";
import { navigateToActivePage } from "../../../layouts/navigateToActivePage";

type Status = {
  icon: "mdi-microphone" | "mdi-microphone-off" | "mdi-microphone-outline";
  title: string;
  message: string;
  useAudio?: boolean;
  retryable: boolean;
};

const statusFromState = (state: AppState): Status => {
  switch (state.value) {
    case "noWebAudio":
    case "error":
      return {
        icon: "mdi-microphone-off",
        title: "No microphone",
        message:
          state.context.message || "Audio recorder not available or allowed",
        retryable: true
      };
    case "setupSynthesizer":
      return {
        icon: "mdi-microphone-off",
        title: "Using synthesizer",
        message:
          state.context.message || "Audio recorder not available or allowed",
        useAudio: true,
        retryable: false
      };
    case "running":
    case "resuming":
    case "suspended":
      return {
        icon: "mdi-microphone",
        title: "Microphone found",
        message: "",
        retryable: false
      };
    default:
      return {
        icon: "mdi-microphone-outline",
        title: "",
        message: "",
        retryable: false
      };
  }
};

type Props = {
  service: AppService;
};

export default {
  props: {
    service: Object
  },

  setup(propsUnknown: unknown) {
    const props = propsUnknown as Props;

    const { state, send, service } = useService(props.service);

    const appState = state.value as AppState;

    const status = ref(statusFromState(appState));

    service.value.onTransition(e => {
      status.value = statusFromState(e as AppState);
    });

    const useSynthesizer = () => {
      send("USE_SYNTH");

      setTimeout(() => {
        navigateToActivePage(service.value);
      }, 0);
    };

    const useAudio = () => {
      send("USE_AUDIO");

      setTimeout(() => {
        navigateToActivePage(service.value);
      }, 0);
    };

    return {
      send,
      status,
      useSynthesizer,
      useAudio
    };
  }
};
</script>
