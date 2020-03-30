const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(e => {
      console.error(
        "Webcam access denied! This site needs webcam access to work. " + e
      );
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0, 0, width, height);
    
    //pixels = redEffect(pixels);
    //pixels = split(pixels)
    pixels = greenScreen(pixels)
    //ctx.globalAlpha = 0.05
    ctx.putImageData(pixels, 0, 0);
    
  }, 40);
}

function takePhoto() {
  // play sound
  snap.currentTime = 0;
  snap.play();

  // take data out of canvas
  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "pretty");
  link.innerHTML = `<img src='${data}' alt='Looking good!' />`;
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
    // pixels.data[i + 1] = pixels.data[i + 1] + 75; //green
    // pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
    // pixels[i+3] is alpha (transparancy) but we don't need to mess with that here
  }
  return pixels
}

function split(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 150] = pixels.data[i + 0]; //red
    pixels.data[i + 320] = pixels.data[i + 1]; //green
    pixels.data[i + 500] = pixels.data[i + 2]; //blue
    // pixels.data[i+3]  //alpha (transparancy) but we don't need to mess with that here
  }
  return pixels
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  })

  for (let i = 0; i < pixels.data.length; i += 4) {
    red = pixels.data[i + 0]; //red
    green = pixels.data[i + 1]; //green
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3]

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
        pixels.data[i + 3] = 0
      }
  }
  return pixels
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
