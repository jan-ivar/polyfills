if (!self.MediaStreamTrackProcessor) {
  self.MediaStreamTrackProcessor = class MediaStreamTrackProcessor {
    constructor({track}) {
      const video = document.createElement("video");
      video.srcObject = new MediaStream([track]);
      const loaded = Promise.all([
        video.play(),
        new Promise(r => video.onloadedmetadata = r)
      ]);

      this.track = track;
      const interval = 1000 / track.getSettings().frameRate;
      let canvas, ctx, t1 = performance.now();

      this.readable = new ReadableStream({
        async start(controller) {
          await loaded;
          canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
          ctx = canvas.getContext('2d', {desynchronized: true});
        },
        async pull(controller) {
          while (performance.now() - t1 < interval) {
            await new Promise(r => requestAnimationFrame(r));
          }
          t1 = performance.now();
          ctx.drawImage(video, 0, 0);
          controller.enqueue(new VideoFrame(canvas, {timestamp: t1}));
        }
      });
    }
  };
}
