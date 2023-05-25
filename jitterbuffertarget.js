if (!('jitterBufferTarget' in RTCRtpReceiver.prototype) &&
    'playoutDelayHint' in RTCRtpReceiver.prototype) {
  Object.defineProperty(RTCRtpReceiver.prototype, 'jitterBufferTarget', {
    get() {
      const value = this.playoutDelayHint;
      return value ? value * 1000 : value;
    },
    set(value) {
      this.playoutDelayHint = value ? value / 1000 : value;
    }
  });
}
