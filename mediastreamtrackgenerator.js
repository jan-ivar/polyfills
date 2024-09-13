if (!window.MediaStreamTrackGenerator) {
  window.MediaStreamTrackGenerator = class MediaStreamTrackGenerator {
    constructor() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d', {desynchronized: true});
      this.track = canvas.captureStream().getVideoTracks()[0];
      this.writable = new WritableStream({
        write: frame => {
          canvas.width = frame.displayWidth;
          canvas.height = frame.displayHeight;
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          frame.close();
        },
      });
    }
  };
}
