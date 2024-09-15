function worklet() {
  registerProcessor('MstpShim', class Processor extends AudioWorkletProcessor {
      constructor() { super(); }
      process(input) { this.port.postMessage(input); return true; }
    }
  );
}

if (!self.MediaStreamTrackProcessor) {
  self.MediaStreamTrackProcessor = class MediaStreamTrackProcessor {
    constructor({track}) {
      if (track.kind == "video") {
        this.readable = new ReadableStream({
          async start(controller) {
            this.video = document.createElement("video");
            this.video.srcObject = new MediaStream([track]);
            await Promise.all([this.video.play(), new Promise(r => this.video.onloadedmetadata = r)]);
            this.track = track;
            this.canvas = new OffscreenCanvas(this.video.videoWidth, this.video.videoHeight);
            this.ctx = this.canvas.getContext('2d', {desynchronized: true});
            this.t1 = performance.now();
          },
          async pull(controller) {
            while (performance.now() - this.t1 < 1000 / track.getSettings().frameRate) {
              await new Promise(r => requestAnimationFrame(r));
            }
            this.t1 = performance.now();
            this.ctx.drawImage(this.video, 0, 0);
            controller.enqueue(new VideoFrame(this.canvas, {timestamp: this.t1}));
          }
        });
      } else if (track.kind == "audio") {
        this.readable = new ReadableStream({
          async start(controller) {
            this.ac = new AudioContext;
            this.buffered = [];
            await this.ac.audioWorklet.addModule(`data:text/javascript,(${worklet.toString()})()`);
            this.node = new AudioWorkletNode(this.ac, 'MstpShim');
            this.ac.createMediaStreamSource(new MediaStream([track])).connect(this.node);
            this.node.port.addEventListener("message", ({data}) => data[0][0] && this.buffered.push(data));
          },
          async pull(controller) {
            while (!this.buffered.length) await new Promise(r => this.node.port.onmessage = r);
            const data = this.buffered.shift();
            const joined = new Float32Array(data[0].reduce((a, b) => a + b.length, 0));
            data[0].reduce((o, a) => (joined.set(a, o), o + a.length), 0);

            controller.enqueue(new AudioData({
              format: "f32-planar",
              sampleRate: this.ac.sampleRate,
              numberOfFrames: data[0][0].length,
              numberOfChannels:  data[0].length,
              timestamp: this.ac.currentTime * 1e6 | 0,
              data: joined,
              //transfer [audio[0]]
            }));
         }
        });
      }
    }
  };
}
