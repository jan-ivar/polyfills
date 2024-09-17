function spectrum(stream, canvas) {
  const ac = new AudioContext();
  const analyser = ac.createAnalyser();
  ac.createMediaStreamSource(stream).connect(analyser);
  const ctx = canvas.getContext("2d");
  const data = new Uint8Array(canvas.width);
  ctx.strokeStyle = 'rgb(0, 125, 0)';

  const interval = setInterval(() => {
    ctx.fillStyle = "#a0a0a0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(data);
    ctx.lineWidth = 2;
    let x = 0;
    for (let d of data) {
      const y = canvas.height - (d / 128) * canvas.height / 4;
      const c = Math.floor((x*255)/canvas.width);
      ctx.fillStyle = `rgb(${c},0,${255-x})`;
      ctx.fillRect(x++, y, 2, canvas.height - y)
    }
    analyser.getByteTimeDomainData(data);
    ctx.lineWidth = 5;
    ctx.beginPath();
    x = 0;
    for (let d of data) {
      const y = canvas.height - (d / 128) * canvas.height / 2;
      x ? ctx.lineTo(x++, y) : ctx.moveTo(x++, y);
    }
    ctx.stroke();
  }, 1000 * canvas.width / ac.sampleRate);

  const cleanup = () => { ac.close(); clearInterval(interval); };
  const [track] = stream.getAudioTracks();
  track.addEventListener("ended", cleanup, {once: true});
  track.stop_ = track.stop;
  track.stop = () => track.stop_(cleanup());
  return stream;
};
