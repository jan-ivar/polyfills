WebTransport = WebTransport || QuicTransport;

if (!('outgoingBidirectionalStreams' in WebTransport.prototype)) {
  Object.defineProperty(WebTransport.prototype, 'outgoingBidirectionalStreams', {
    get() {
      const transport = this;
      if (!this._outgoingBidirectionalStreams) {
        this._outgoingBidirectionalStreams = new WritableStream({
          async write(stream) {
            const {writable, readable} = await transport.createBidirectionalStream();
            await stream.readable.pipeTo(writable);
            await readable.pipeTo(stream.writable);
          }
        });
      }
      return this._outgoingBidirectionalStreams;
    }
  });
}

if (!('bidirectionalStreams' in WebTransport.prototype)) {
  Object.defineProperty(WebTransport.prototype, 'bidirectionalStreams', {
    get() {
      const transport = this;
      if (!this._bidirectionalStreams) {
        this._bidirectionalStreams = Object.freeze({
          readable: transport.incomingBidirectionalStreams,
          writable: transport.outgoingBidirectionalStreams
        });
      }
      return this._bidirectionalStreams;
    }
  });
}
