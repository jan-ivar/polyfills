if (!self.MediaStreamTrackProcessor) {
  self.MediaStreamTrackProcessor = class MediaStreamTrackProcessor {
    constructor({track}) {
      const video = document.createElement("video");
      video.srcObject = new MediaStream([track]);
      const loaded = Promise.all([video.play(), new Promise(r => video.onloadedmetadata = r)]);
      this.track = track;
      this.readable = new ReadableStream({
        async start(controller) {
          await loaded;
          this.canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
          this.ctx = canvas.getContext('2d', {desynchronized: true});
          this.t1 = performance.now();
        },
        async pull(controller) {
          while (performance.now() - this.t1 < 1000 / track.getSettings().frameRate) {
            await new Promise(r => requestAnimationFrame(r));
          }
          this.t1 = performance.now();
          ctx.drawImage(video, 0, 0);
          controller.enqueue(new VideoFrame(canvas, {timestamp: this.t1}));
        }
      });
    }
  };
}
