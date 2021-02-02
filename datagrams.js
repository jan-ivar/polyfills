WebTransport = WebTransport || QuicTransport;

if (!('datagrams' in WebTransport.prototype)) {
  Object.defineProperty(WebTransport.prototype, 'datagrams', {
    get() {
      const transport = this;
      if (!this._datagrams) {
        this._datagrams = Object.freeze({
          readable: transport.datagramReadable,
          writable: transport.datagramWritable
        });
      }
      return this._datagrams;
    }
  });
}
