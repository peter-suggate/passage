import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/HomeView.vue";
// import Listen from "../views/ListenView.vue";
import { Routes } from "./Routes";
export * from "./redirects";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: Routes.Home,
    name: "Home",
    component: Home,
  },
  // {
  //   path: Routes.About,
  //   name: "About",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/About.vue"),
  // },
  {
    path: Routes.Setup,
    name: "Setup",
    component: () => import("../views/SetupView.vue"),
  },
  {
    path: Routes.Listen,
    name: "Listen",
    // component: Listen,
    component: () => import("../views/ListenView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;

export { Routes };
