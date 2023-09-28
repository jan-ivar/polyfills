if (!window.VideoTrackGenerator) {
  window.VideoTrackGenerator = class VideoTrackGenerator {
    constructor() {
      // Sadly, OffscreenCanvas doesn't have captureStream
      //const canvas = new OffscreenCanvas(1280, 720);
      const canvas = document.createElement("canvas");

      const ctx = canvas.getContext('2d', {desynchronized: true});
      const stream = canvas.captureStream();
      this.track = stream.getVideoTracks()[0];
      let frames = 0, fps = 0, f1 = 0, t1 = performance.now();
      this.writable = new WritableStream({
        write: frame => {
          frames++;
          const now = performance.now();
          if (now - t1 > 1000) {
            fps = (frames - f1) / ((now - t1) / 1000);
            f1 = frames;
            t1 = now;
          }
          const {displayWidth, displayHeight, timestamp} = frame;
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          frame.close();
        },
      });
    }
  };
}
