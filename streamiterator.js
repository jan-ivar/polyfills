if (!ReadableStream.prototype[Symbol.asyncIterator]) {
  ReadableStream.prototype[Symbol.asyncIterator] = function() {
    const stream = this;
    return {
      reader: null,
      next() {
        this.reader ||= stream.getReader();
        const result = this.reader.read();
        if (result.done) reader.releaseLock();
        return result;
      }
    };
  }
}
