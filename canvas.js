var canvasElement = document.getElementById("canvas");
var video = document.querySelector("#videoElement");
var ImageData;
var webcamInit = 0;

var rows = window.innerHeight,
  cols = window.innerWidth;

function resizeCanvas() {
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

var pixelData = new Array(257 * 10 * 3);
var byteArray = new Uint8Array(pixelData.length);
var pixelBlockDivider = 8;
var pixelBlocksWide = cols / pixelBlockDivider,
  pixelBlocksHigh = rows / pixelBlockDivider;
var pxPerWidth = cols / pixelBlocksWide,
  pxPerHeight = rows / pixelBlocksHigh;

var textArray = "10!@#$%^&*()_+~`|}{[]:;?><,./-=".split("");

var canvasContext = canvasElement.getContext("2d", {
  willReadFrequently: true,
});
canvasElement.width = cols;
canvasElement.height = rows;

setInterval(capture, 30);

initWebCam();

function initWebCam() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        webcamInit = 1;
      })
      .catch(function () {
        console.log("Something went wrong!");
      });
  }
}

function capture() {
  if (webcamInit) {
    canvasContext.drawImage(
      video,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    ImageData = canvasContext.getImageData(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    drawPixelBlocks();
    drawMatrixRain();
  }
}

var pulseTime = 0;

function drawPixelBlocks() {
  var pbYCount = 0,
    pbXcount = 0;
  var blockColourStroke = "rgba(0,0,0,1)";

  // Define two close RGB colors for the pulse effect
  var colorStart = { r: 61, g: 249, b: 104 };
  var colorEnd = { r: 51, g: 239, b: 94 }; // Slightly different RGB values
  var pulseSpeed = 0.05; // Adjust the speed of the pulse here

  // Calculate the interpolation factor using a sine wave
  var interpolationFactor = (Math.sin(pulseTime) + 1) / 2; // Oscillates between 0 and 1
  pulseTime += pulseSpeed;

  // Interpolate between the two colors
  var r = Math.round(
    colorStart.r + (colorEnd.r - colorStart.r) * interpolationFactor
  );
  var g = Math.round(
    colorStart.g + (colorEnd.g - colorStart.g) * interpolationFactor
  );
  var b = Math.round(
    colorStart.b + (colorEnd.b - colorStart.b) * interpolationFactor
  );

  var blockColourFill = `rgba(${r}, ${g}, ${b}, 1)`; // Keep alpha at 1 for full opacity

  // var blockColourFill = "rgba(61, 249, 104, 0.4)";
  var currentX = 0,
    currentY = 0;
  var perBlockXCnt = 0,
    perBlockYCnt = 0;
  var pxPerBlockCounter = 0;
  var pxBlockColour = [0, 0, 0],
    currentPixelInBlock = Array();
  var textIndex = 0;

  for (pbYCount = 0; pbYCount < pixelBlocksHigh; pbYCount++) {
    currentY = pbYCount * pxPerHeight;
    for (pbXcount = 0; pbXcount < pixelBlocksWide; pbXcount++) {
      currentX = pbXcount * pxPerWidth;
      pxPerBlockCounter = 0;
      pxBlockColour[0] = 0;
      pxBlockColour[1] = 0;
      pxBlockColour[2] = 0;

      for (
        perBlockYCnt = currentY;
        perBlockYCnt < currentY + pxPerHeight;
        perBlockYCnt++
      ) {
        for (
          perBlockXCnt = currentX;
          perBlockXCnt < currentX + pxPerWidth;
          perBlockXCnt++
        ) {
          currentPixelInBlock = getPixel(perBlockXCnt, perBlockYCnt);
          pxBlockColour[0] += currentPixelInBlock[0];
          pxBlockColour[1] += currentPixelInBlock[1];
          pxBlockColour[2] += currentPixelInBlock[2];
          pxPerBlockCounter++;
        }
      }
      pxBlockColour[0] = pxBlockColour[0] / pxPerBlockCounter;
      pxBlockColour[1] = pxBlockColour[1] / pxPerBlockCounter;
      pxBlockColour[2] = pxBlockColour[2] / pxPerBlockCounter;

      canvasContext.strokeStyle = blockColourStroke;
      canvasContext.fillStyle = blockColourStroke;
      canvasContext.beginPath();
      canvasContext.rect(currentX, currentY, pxPerWidth, pxPerHeight);
      canvasContext.fill();
      textIndex =
        (((pxBlockColour[0] + pxBlockColour[1] + pxBlockColour[2]) / 3 / 256) *
          textArray.length) %
        textArray.length;
      canvasContext.fillStyle = blockColourFill;
      canvasContext.font = "12px Arial";
      canvasContext.textAlign = "center";
      canvasContext.fillText(
        textArray[Math.round(textIndex) % textArray.length],
        currentX + pxPerWidth / 2,
        currentY + pxPerHeight / 2
      );
    }
  }
}

var webcamDrops = [];
for (var i = 0; i < pixelBlocksWide; i++) {
  webcamDrops[i] = {
    x: i * pxPerWidth,
    y: Math.random() * pixelBlocksHigh,
    char: "",
  };
}

function getPixel(x, y) {
  var startAddress = y * (4 * cols) + x * 4;
  return [
    ImageData.data[startAddress],
    ImageData.data[startAddress + 1],
    ImageData.data[startAddress + 2],
  ];
}

function drawMatrixRain() {
  canvasContext.fillStyle = "#000";
  canvasContext.globalAlpha = 0.05; // Lower values will make the tail longer
  canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
  canvasContext.globalAlpha = 1; // Reset alpha

  canvasContext.fillStyle = "#3df968";
  canvasContext.font = "10px Arial";

  for (var i = 0; i < drops.length; i++) {
    if (!drops[i].char) {
      drops[i].char = textArray[Math.floor(Math.random() * textArray.length)];
    }

    canvasContext.fillText(drops[i].char, i * 10, drops[i].y * 10);

    if (drops[i].y * 10 > window.innerHeight && Math.random() > 0.975) {
      drops[i] = {
        y: 0,
        char: textArray[Math.floor(Math.random() * textArray.length)],
      };
    } else {
      drops[i].y++;
    }
  }
}

var drops = [];
for (var i = 0; i < window.innerWidth / 2; i++) {
  drops[i] = {
    y: Math.random() * window.innerHeight,
    char: textArray[Math.floor(Math.random() * textArray.length)],
  };
}

setInterval(drawMatrixRain, 30);

// Record video
const videoElement = document.querySelector("#videoElement");
const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");

let mediaRecorder;
let chunks = [];

// Function to start recording the canvas
const startRecording = () => {
  // Capture the stream from the canvas
  const stream = canvasElement.captureStream(30); // 30 FPS - adjust as needed
  const mimeType = "video/webm";

  // Check if the mimeType is supported
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    console.error(`${mimeType} is not supported!`);
    return;
  }

  mediaRecorder = new MediaRecorder(stream, { mimeType });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  mediaRecorder.onstop = saveVideo;

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

// Function to stop recording the canvas
const stopRecording = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

// Function to save the video file
const saveVideo = () => {
  const blob = new Blob(chunks, { type: "video/webm" });
  chunks = [];

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = url;
  a.download = "recording.webm";
  a.click();
  window.URL.revokeObjectURL(url);
};

startBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", stopRecording);
