WebTransport = WebTransport || QuicTransport;

if (!('outgoingUnidirectionalStreams' in WebTransport.prototype)) {
  Object.defineProperty(WebTransport.prototype, 'outgoingUnidirectionalStreams', {
    get() {
      const transport = this;
      if (!this._outgoingUnidirectionalStreams) {
        this._outgoingUnidirectionalStreams = new WritableStream({
          async write(stream) {
            const {writable} = await transport.createUnidirectionalStream();
            await stream.pipeTo(writable);
          }
        });
      }
      return this._outgoingUnidirectionalStreams;
    }
  });
}
