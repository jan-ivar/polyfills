WebTransport = WebTransport || QuicTransport;

if (!('outgoingUnidirectionalStreams' in WebTransport.prototype)) {
  Object.defineProperty(WebTransport.prototype, 'outgoingUnidirectionalStreams', {
    get() {
      const transport = this;
      if (!this._outgoingUnidirectionalStreams) {
        this._outgoingUnidirectionalStreams = new WritableStream({
          async write(stream) {
            const {writable} = await transport.createUnidirectionalStream();
            stream.pipeTo(writable).catch(() => {});
          }
        });
      }
      return this._outgoingUnidirectionalStreams;
    }
  });
}

if (!('unidirectionalStreams' in WebTransport.prototype)) {
  Object.defineProperty(WebTransport.prototype, 'unidirectionalStreams', {
    get() {
      const transport = this;
      if (!this._unidirectionalStreams) {
        this._unidirectionalStreams = Object.freeze({
          readable: transport.incomingUnidirectionalStreams,
          writable: transport.outgoingUnidirectionalStreams
        });
      }
      return this._unidirectionalStreams;
    }
  });
}
