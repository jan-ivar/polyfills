if (!('state' in WebTransport.prototype)) {
  const nativeWebTransport = window.WebTransport.bind(window);

  window.WebTransport = function(url, options) {
    const wt = new nativeWebTransport(url, options);
    wt.state = "connecting";
    wt.ready.then(() => wt.state = "connected", () => wt.state = "failed");
    wt.closed.then(() => wt.state = "closed", () => wt.state = "failed");
    wt.draining?.then(() => wt.state = "draining", () => {});
    return wt;
  };
}
