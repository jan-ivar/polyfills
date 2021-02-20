if (!('createStreamOfUnidirectionalStreams' in WebTransport.prototype)) {
  WebTransport.prototype.createStreamOfUnidirectionalStreams =
      function createStreamOfUnidirectionalStreams() {
    const transport = this;
    return new WritableStream({
      async write(stream) {
        const {writable} = await transport.createUnidirectionalStream();
        await stream.pipeTo(writable);
      }
    });
  }
}
