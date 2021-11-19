import { screen } from "./screen.js";
import { createChild } from "./utility.js";

screen(
  document.body,
  () => {
    createChild(document.body, "div").textContent = "pass";
  },
  () => {
    createChild(document.body, "div").textContent = "fail";
  }
);
