navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if (navigator.getUserMedia) {
  navigator.getUserMedia({video: true}, (stream) => {
    const video = document.querySelector("video");
    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream);
    }
    video.onloadeddata = () => {
      video.play();
      startDetection();
    }
  }, (e) => {
    console.error(e);
  });
} else {
  console.error("Your browser does not support webcam access.")
}

async function startDetection() {
  const video = document.querySelector("video");
  const boxEl = document.querySelector("#box");
  const eyes = document.querySelectorAll(".eye");
  const eyesDiv = document.querySelector("#eyes");

  await faceapi.nets.ssdMobilenetv1.loadFromUri('./model');

  console.log("started");
  
  window.setInterval(async () => {
    const detection = await faceapi.detectSingleFace(video);

    if (detection) {
      eyesDiv.style.opacity = 1;

      const detBox = detection.box;
      const videoBox = video.getBoundingClientRect(); 

      const x = (((detBox.x + detBox.width / 2) - videoBox.width / 2) / videoBox.width) * -100;
      const y = (((detBox.y + detBox.height / 2) - videoBox.height / 2) / videoBox.height) * 100;

      for (let i=0; i<eyes.length; i++) {
        const e = eyes[i];
        e.style.transform = `translate(-50%, -50%) translateX(${Math.round(x)}px) translateY(${Math.round(y)}px)`;
      }

      /* Visual representation on the video element */
      boxEl.style.left = detBox.x + "px";
      boxEl.style.top = detBox.y + "px";
      boxEl.style.width = detBox.width + "px";
      boxEl.style.height = detBox.height + "px";
    } else {
      eyesDiv.style.opacity = 0;
    }
  }, 10);
}