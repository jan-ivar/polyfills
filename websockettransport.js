// This proof-of-concept WebSocket-like wrapper around WebTransport translates
// the familiar WS-api into a stream-per-message model w/TEXT or DATA headers.
//
// It does not use message framing into a single stream, which is another way.
//
// The WS-api is a poor fit for modern streaming (no back pressure or streams),
// so this is meant as a transitional learning tool to using streams directly.

class WebSocketTransport extends EventTarget {
  constructor(url) {
    super();
    this._onopen = null;
    this._onerror = null;
    this._onmessage = null;
    this._err = message => this.dispatchEvent(Object.assign(new Event("error"),
                                                            {message}));
    const wt = new WebTransport(url);
    const streams = new TransformStream();
    this._writer = streams.writable.getWriter();
    this._encoder = new TextEncoder("utf-8");
    this._decoder = new TextDecoder("utf-8");
    streams.readable
      .pipeTo(wt.createStreamOfUnidirectionalStreams())
      .catch(e => this._err(e.message));

    (async () => {
      try {
        await wt.ready;
        this.dispatchEvent(new Event("open"));

        for await (const stream of wt.unidirectionalStreams.readable) {
          const chunks = [];
          for await (const chunk of stream.readable) chunks.push(chunk);

          // Here we'd detect incoming TEXT or DATA headers from a real server.
          // Alas, the "webrtc.internaut.com:6161/counter" test server this
          // polyfill is designed to work with ATM only returns byte counts...
          const event = new Event("message");
          event.data = chunks.map(c => this._decoder.decode(c)).join("");
          this.dispatchEvent(event);
        }
      } catch (e) {
        this._err(e.message);
      }
    })();
  }

  async send(msg) {
    const stream = new TransformStream();
    await this._writer.write(stream.readable);
    const writer = stream.writable.getWriter();

    if (msg instanceof Blob) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(msg);
      await new Promise(r => reader.onload = r);
      msg = reader.result;
    }
    if (msg instanceof ArrayBuffer) {
      await Promise.all([
        writer.write(this._encoder.encode(`DATA`)),
        writer.write(msg)
      ]);
    } else if (typeof msg == "string") {
      await writer.write(this._encoder.encode(`TEXT${text.value}`));
    }
    await writer.close();
  }

  get onopen() { return this._onopen; }
  get onerror() { return this._onerror; }
  get onmessage() { return this._onmessage; }
  set onopen(f) {
    if (this._onopen) {
      this.removeEventListener("open", this._onopen);
    }
    this.addEventListener("open", this._onopen = f);
  }
  set onerror(f) {
    if (this._onerror) {
      this.removeEventListener("error", this._onerror);
    }
    this.addEventListener("error", this._onerror = f);
  }
  set onmessage(f) {
    if (this._onmessage) {
      this.removeEventListener("message", this._onmessage);
    }
    this.addEventListener("message", this._onmessage = f);
  }
}
