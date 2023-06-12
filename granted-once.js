async function shimGrantedOnce(name) {
  try {
    const status = await window.navigator.permissions.query({name});
    status.onchange = () => {
      if (status.state == "granted") {
        window.localStorage[`queryShim_${name}_grantedOnce`] = true;
      } else if (status.state == "denied") {
        delete window.localStorage[`queryShim_${name}_grantedOnce`];
      }
    };
    status.onchange();
  } catch (e) {}
}
shimGrantedOnce("camera");
shimGrantedOnce("microphone");
shimPermissionNameMap = {
  camera: "camera",
  microphone: "microphone",
  video_capture: "camera",
  audio_capture: "microphone",
};

const originalGetter = Object.getOwnPropertyDescriptor(PermissionStatus.prototype, 'state').get;

Object.defineProperty(PermissionStatus.prototype, 'state', {
  get: function() {
    const name = shimPermissionNameMap[this.name];
    if (name != "camera" && name != "microphone") {
      return originalGetter.call(this);
    }
    const state = originalGetter.call(this);
    return (state == "prompt" &&
            window.localStorage[`queryShim_${name}_grantedOnce`])? "granted-once" : state;
  }
});
