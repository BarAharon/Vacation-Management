import { reactive } from "vue";

export const store = reactive({
  currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
  },

  clearUser() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  },
});
