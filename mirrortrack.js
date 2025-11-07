/**
 * Create a mirrored control clone of a track
 * @param {MediaStreamTrack} track about to be transferred away.
 * @param {{send: ({cmd, value}) => worker.postMessage(msg)}}
 *    cmd = "applyConstraints" | "setEnabled" | "stop"
 */
function mirrorTrack(original, {send}) {
  const track = original.clone();
  const apply0 = track.applyConstraints.bind(track);
  track.applyConstraints = async function applyConstraints(value = {}) {
    send({cmd: 'applyConstraints', value});
    await apply0(value);
  }
  const proto = Object.getPrototypeOf(track);
  const enabled0 = Object.getOwnPropertyDescriptor(proto, 'enabled');
  Object.defineProperty(track, 'enabled', {
    get() { return enabled0.get.call(track); },
    set(value) {
      send({cmd: 'setEnabled', value});
      enabled0.set.call(track, value);
    },
    configurable: true, enumerable: enabled0.enumerable
  });
  const stop0 = track.stop.bind(track);
  track.stop = function stop() {
    send({cmd: 'stop'});
    stop0();
  }
  return track;
}
