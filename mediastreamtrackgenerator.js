if (!window.MediaStreamTrackGenerator) {
  window.MediaStreamTrackGenerator = class MediaStreamTrackGenerator {
    constructor({kind}) {
      if (kind == "video") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d', {desynchronized: true});
        const track = canvas.captureStream().getVideoTracks()[0];
        track.writable = new WritableStream({
          write(frame) {
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            frame.close();
          }
        });
        return track;
      } else if (kind == "audio") {
        const ac = new AudioContext;
        const dest = ac.createMediaStreamDestination();
        const [track] = dest.stream.getAudioTracks();
        track.writable = new WritableStream({
          async start(controller) {
            this.buffered = [];
            function worklet() {
              registerProcessor("mstg-shim", class Processor extends AudioWorkletProcessor {
                constructor() {
                  super();
                  this.buffers = [];
                  this.bufferOffset = 0;
                  this.port.onmessage = ({data}) => this.buffers.push(data);
                  this.emptyBuffer = new Float32Array(0);
                }
                process(inputs, [[output]]) {
                  for (let i = 0; i < output.length; i++) {
                    if (!this.buffer || this.bufferOffset >= this.buffer.length) {
                      this.buffer = this.buffers.shift() || this.emptyBuffer;
                      this.bufferOffset = 0;
                    }
                    output[i] = this.buffer[this.bufferOffset++] || 0;
                  }
                  return true;
                }
              });
            }
            await ac.audioWorklet.addModule(`data:text/javascript,(${worklet.toString()})()`);
            this.node = new AudioWorkletNode(ac, "mstg-shim");
            this.node.connect(dest);
            return track;
          },
          write(audioData) {
            const buffer = new Float32Array(audioData.numberOfFrames * audioData.numberOfChannels);
            audioData.copyTo(buffer, {planeIndex: 0});
            this.node.port.postMessage(buffer, [buffer]);
            audioData.close();
          }
        });
        return track;
      }
    }
  };
}
