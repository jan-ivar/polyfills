function makeProgressBar(file) {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth - 20;
  canvas.height = 16;
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = '#000000';
  ctx.fillRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
  ctx.fillStyle = '#000000';
  return {
    progress(pos) {
      ctx.fillRect(2, 2, (canvas.width-4) * (pos/file.size), canvas.height-4);
    }
  };
}
