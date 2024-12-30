
export class KeyBindingManager {
  constructor() {
    this.bindings = {};
    document.addEventListener('keydown', (event) => {
      if (event.key in this.bindings) {
        this.bindings[event.key]();
      }
    });
  }
  register(key, action) {
    this.bindings[key] = action;
  }
}
