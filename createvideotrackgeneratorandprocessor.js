if (!("createVideoTrackGeneratorAndProcessor" in navigator.mediaDevices)) {
  navigator.mediaDevices.createVideoTrackGeneratorAndProcessor = async function createVideoTrackGeneratorAndProcessor(worker, track) {
    const before = track.clone();
    worker.postMessage({before}, [before]);
    const {data} = await new Promise(r => worker.addEventListener("message", r, {once: true}));
    track._originalApplyConstraints = track.applyConstraints;
    track.applyConstraints = function applyConstraints(constraints) {
      worker.postMessage({constraints});
      return track._originalApplyConstraints(constraints);
    }
    return data.after;
  }
}
