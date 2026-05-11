import { createRouter, createWebHistory } from "vue-router";
import { store } from "../store/index.js";
import HomeView from "../views/HomeView.vue";
import RequesterView from "../views/RequesterView.vue";
import ValidatorView from "../views/ValidatorView.vue";

const routes = [
  { path: "/", component: HomeView },
  {
    path: "/requester",
    component: RequesterView,
    beforeEnter: (to, from, next) => {
      if (!store.currentUser || store.currentUser.role !== "Requester") {
        return next("/");
      }
      next();
    },
  },
  {
    path: "/validator",
    component: ValidatorView,
    beforeEnter: (to, from, next) => {
      if (!store.currentUser || store.currentUser.role !== "Validator") {
        return next("/");
      }
      next();
    },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
