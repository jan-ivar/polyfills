if (!window.MediaStreamTrackProcessor) {
  window.MediaStreamTrackProcessor = class MediaStreamTrackProcessor {
    constructor({track}) {
      const video = document.createElement("video");
      video.srcObject = new MediaStream([track]);
      const loaded = new Promise(r => video.onloadedmetadata = r);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d', {desynchronized: true});

      this.track = track;
      let interval = 1000 / track.getSettings().frameRate;
      let t1 = performance.now();

      this.readable = new ReadableStream({
        async start(controller) {
          await loaded;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
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

