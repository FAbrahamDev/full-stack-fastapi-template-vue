import { createApp } from "vue";
import "./style.scss";
import "primeicons/primeicons.css";

import App from "./App.vue";
import { registerPlugins } from "@/plugins";

import { client } from "@/client";

client.setConfig({
  auth: () => localStorage.getItem("access_token") || "",
  baseURL: import.meta.env.VITE_API_URL,
});

const app = createApp(App);

registerPlugins(app);

app.mount("#app");
