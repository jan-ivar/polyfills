if (!window.RTCRtpSender.prototype.createEncodedStreams) {
  function promiseToReadable(promiseForReadable) {
    const {writable, readable} = new TransformStream;
    promiseForReadable.then(result => result.pipeTo(writable)).catch(e => writable.abort(e));
    return readable;
  }
  function promiseToWritable(promiseForWritable) {
    const {writable, readable} = new TransformStream;
    promiseForWritable.then(result => readable.pipeTo(result)).catch(e => readable.cancel(e));
    return writable;
  }
  window.RTCRtpSender.prototype.createEncodedStreams =
  window.RTCRtpReceiver.prototype.createEncodedStreams = function createEncodedStreams() {
    function work() {
      const originals = [];
      onrtctransform = async ({transformer: {readable, writable, options}}) => {
        const diverter = new TransformStream({transform: (original, controller) => {
          originals.push(original);
          controller.enqueue(original);
        }});
        const reinserter = new TransformStream({transform: (frame, controller) => {
          const original = originals.shift();
          original.data = frame.data;
          controller.enqueue(original);
        }});
        self.postMessage({readable: diverter.readable, writable: reinserter.writable},
                         {transfer: [diverter.readable, reinserter.writable]});
        await readable
            .pipeThrough({writable: diverter.writable, readable: reinserter.readable})
            .pipeTo(writable);
      }
    }
    this._worker = new Worker(`data:text/javascript,(${work.toString()})()`);
    this.transform = new RTCRtpScriptTransform(this._worker);
    const promise = new Promise(r => this._worker.onmessage = r);
    return {
      readable: promiseToReadable(promise.then(({data: {readable}}) => readable)),
      writable: promiseToWritable(promise.then(({data: {writable}}) => writable))
    };
  }
}
