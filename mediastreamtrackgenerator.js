if (!window.MediaStreamTrackGenerator) {
  window.MediaStreamTrackGenerator = class MediaStreamTrackGenerator {
    constructor({kind}) {
      if (kind == "video") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d', {desynchronized: true});
        const track = canvas.captureStream().getVideoTracks()[0];
        track.writable = new WritableStream({
          write: frame => {
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            frame.close();
          }
        });
        return track;
      } else if (kind == "audio") {
        const ac = new AudioContext;
        const generator = this;
        const dest = createMediaStreamDestination();
        this.track = dest.stream.getAudioTracks()[0];
        this.writable = new WritableStream({
          async start(controller) {
            this.buffered = [];
            function worklet() {
              registerProcessor("mstg-shim", class Processor extends AudioWorkletProcessor {
                  process(input, output) {
                    this.port.postMessage(input);
                    return true;
                  }
              });
            }
            await ac.audioWorklet.addModule(`data:text/javascript,(${worklet.toString()})()`);
            this.node = new AudioWorkletNode(ac, "mstp-shim");
            this.node.connect(dest);
          },
          write: audioData => {
            this.node.port.postMessage("message", ({data}) => data[0][0] && this.buffered.push(data));
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            audioData.close();
          },
        });
      }
    }
  };
}
