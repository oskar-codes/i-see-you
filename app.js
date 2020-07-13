if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraintObj) {
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
      return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraintObj, resolve, reject);
      });
  }
} else {
  navigator.mediaDevices.enumerateDevices()
  .then(devices => {
      devices.forEach(device=>{
          console.log(device.kind.toUpperCase(), device.label);
          //, device.deviceId
      })
  })
  .catch( e=> {
      console.error(e.name, e.message);
  })
}
navigator.mediaDevices.getUserMedia({video: true})
.then(function(mediaStreamObj) {
  //connect the media stream to the first video element
  let video = document.querySelector('video');
  if ("srcObject" in video) {
      video.srcObject = mediaStreamObj;
  } else {
      //old version
      video.src = window.URL.createObjectURL(mediaStreamObj);
  }

  video.onloadedmetadata = function(ev) {
      //show in the video element what is being captured by the webcam
      video.play();
      startDetection();
  };
})
.catch(function(err) { 
  console.log(err.name, err.message); 
});

async function startDetection() {
  const video = document.querySelector("video");
  const boxEl = document.querySelector("#box");
  const eyes = document.querySelectorAll(".eye");
  const eyesDiv = document.querySelector("#eyes");
  const msg = document.querySelector("h1");

  await faceapi.nets.ssdMobilenetv1.loadFromUri('./model');
  
  msg.innerHTML = "Looking for you...";

  console.log("started");
  
  window.setInterval(async () => {
    const detection = await faceapi.detectSingleFace(video);

    if (detection) {
      msg.style.opacity = 0;
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
