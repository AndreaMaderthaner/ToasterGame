let audioContext = new AudioContext();

//let frequencies = [110, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
//let frequencies1 = [261.6256, 246.9417, 220.0, 195.9977];
//let frequencies2 = [261.6256, 293.6648, 329.6276, 349.2282];

// 4 frequencies:
// [0] -> up and down cancel each other out (perfect balance)
// [1] -> more button presses than needed (players are going to win)
// [2] -> not enough button presses (players are goint to lose)
// [3] -> actively wasting energy (toast already reached bottom of toaster)

// let playerOne = [500, 100, 800, 50];
// let playerTwo = [500, 100, 800, 50];

// let timeForANote = 1;
let playbackControl;
let playbackValue;
let soundIsPlaying = false; // to know if the game started
let endSoundIsPlaying = false;
let gameEnded = false;
const audioCtx = new AudioContext();
let source;
let songLength;

let consumption = 0;
let maxConsumption = 1000;
let minConsumption = 100;
let maxBpm = 500;
let minBpm = 100;
let avgRate = 0;
let counter = 0;

let move; // interval for moving the toast up (depending on consumption)
let speed = 0; // speed of the players' button clicks used to calculate if they are on the track of losing or winning
let time = 20; // Time to hold on
var previousClick = 120;
var clicksPerMin = 120;
let downloadTimer;
let minusBpm;
let goalBpm = 0;
let previousRate = 1;

function getEnergyConsumption() {
  consumption = Math.round(
    Math.random() * (maxConsumption - minConsumption) + minConsumption
  );
}

// function playFrequency(frequency) {
//   // create 2 second worth of audio buffer, with single channels and sampling rate of your device.
//   let sampleRate = audioContext.sampleRate;
//   let duration = timeForANote * sampleRate;
//   let numChannels = 1;
//   let buffer = audioContext.createBuffer(numChannels, duration, sampleRate);
//   console.log(buffer);
//   // fill the channel with the desired frequency's data
//   let channelData = buffer.getChannelData(0);
//   // change sampleRate to use duration instead becaue otherwise you don't fill the value in channelData buffer meaning you don't have the correct duration
//   for (let i = 0; i < duration; i++) {
//     channelData[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
//   }

//   // create audio source node.
//   let source = audioContext.createBufferSource();
//   source.buffer = buffer;
//   source.connect(audioContext.destination);

//   // finally start to play
//   source.start(0);
//   // just to give some time to play the sound
// }

// direction: false -> up, true -> down
function moveToast(direction = false) {
  let bottom = $("#toast").css("margin-bottom");
  let top = $("#toast").css("margin-top");

  let rate = lerp(clicksPerMin, minBpm, maxBpm, 0.5, 1.5);
  // When using the serial ports, the rate is sometimes infinite...
  // So we need to check if it's a number
  if (Number.isNaN(rate)) {
    rate = 1;
  }
  avgRate = (avgRate * counter + rate) / (counter + 1);
  counter = counter + 1;
  if (rate < 1.2 && rate > 0.8) {
    rate = 1;
  }
  if (previousRate == rate) {
    source.playbackRate.value = rate;
    playbackValue.textContent = rate;
  }

  let increment = -1 * lerp(rate, 0.5, 1.5, -5, 5);
  let reachedBottom = parseInt(bottom, 10) < -220;
  if (reachedBottom && increment < 0) {
    increment = 0;
  }
  previousRate = rate;

  if (parseInt(bottom, 10) < 0) {
    $("#toast").css("margin-bottom", parseInt(bottom, 10) + increment + "px");
    $("#toast").css("margin-top", parseInt(top, 10) - increment + "px");
  } else {
    gameEnded = true;
    stop();
    alert("Game over!");
  }
}

function setTimeleft() {
  timeleft = time;
  document.getElementById("countdown").innerHTML =
    timeleft + " seconds remaining";
  downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      document.getElementById("countdown").innerHTML = "Finished";
      clearInterval(downloadTimer);
      gameEnded = true;
      stop();
      alert("Perfect Toast !");
    } else {
      document.getElementById("countdown").innerHTML =
        timeleft + " seconds remaining";
    }
    timeleft -= 1;
  }, 1000);
}

function stop() {
  function handleSound() {
    if (soundIsPlaying || endSoundIsPlaying) {
      StopSound();
      source.playbackRate.value = 1;
      playbackValue.textContent = 1;
    }
    if (gameEnded) {
      PlaySoundEnd();
    }
  }
  handleSound();
  clearInterval(move);
  clearInterval(downloadTimer);
  clearInterval(minusBpm);
}

$(document).ready(function () {
  playbackControl = document.querySelector(".playback-rate-control");
  playbackValue = document.querySelector(".playback-rate-value");
  playbackControl.setAttribute("disabled", "disabled");
  $("#port").click(function () {
    getButtonPress();
  });
  $("#start").click(function () {
    gameEnded = false;
    time = 30 + 10 * document.getElementById("toastiness").value;
    avgRate = 0;
    counter = 0;
    stop();
    getEnergyConsumption();
    goalBpm = Math.floor(
      lerp(consumption, minConsumption, maxConsumption, minBpm, maxBpm)
    );
    $("#consumption").text(consumption);
    $("#taps").text(goalBpm);
    $("#toast").css("margin-bottom", "-200px");
    $("#toast").css("margin-top", "300px");

    // Just an interval to call the function moveToast every 100ms
    // let interval = 200 - Math.round(((consumption * 0.1) / 60) * 100);
    let interval = 100;
    move = setInterval(moveToast, interval);
    setTimeleft();
    minusBpm = setInterval(diminishBpm, interval);
    StartSound();
    // $(".action").removeClass("hide");
    $(".hide").removeClass("hide");

    // playbackControl.oninput = () => {
    //   source.playbackRate.value = playbackControl.value;
    //   playbackValue.textContent = playbackControl.value;
    // };
  });

  $(window).bind("keyup", function (e) {
    if (!soundIsPlaying) return;
    // console.log(e.keyCode);
    // if we use keypress : A = 97 and E = 106.
    // if we use keyup (so people can't stay pressing it) : A = 65 and E = 74.
    // No idea why...
    if (e.keyCode == 65) {
      // playFrequency(playerOne[0]);
      // moveToast(true);
      bpm();
    }

    if (e.keyCode == 74) {
      // playFrequency(playerTwo[0]);
      // moveToast(true);
      bpm();
    }
  });
});

/// =================== SOUND PART =================== ///

// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

function getData() {
  source = new AudioBufferSourceNode(audioCtx);
  request = new XMLHttpRequest();

  request.open(
    "GET",
    "https://upload.wikimedia.org/wikipedia/commons/2/21/Chopin_-_Preludes%2C_Op._28_-_No._20_%27Funeral_march%27.ogg",
    // "https://upload.wikimedia.org/wikipedia/commons/b/be/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg",
    true
  );
  request.responseType = "arraybuffer";

  request.onload = () => {
    let audioData = request.response;

    audioCtx.decodeAudioData(
      audioData,
      (buffer) => {
        songLength = buffer.duration;
        source.buffer = buffer;
        source.playbackRate.value = playbackControl.value;
        source.connect(audioCtx.destination);
        source.loop = true;
      },
      (e) => {
        `Error with decoding audio data ${e.error}`;
      }
    );
  };

  request.send();
}

// wire up buttons to stop and play audio, and range slider control

function StartSound() {
  getData();
  source.start();
  soundIsPlaying = true;
  playbackControl.removeAttribute("disabled");
}

function StopSound() {
  source.stop();
  soundIsPlaying = false;
  playbackControl.setAttribute("disabled", "disabled");
}

function PlaySoundEnd() {
  getData();
  source.start();
  endSoundIsPlaying = true;
  // I don't know why but it doesn't work if I don't put a setTimeout
  setTimeout(() => {
    source.playbackRate.value = Math.floor(avgRate * 100) / 100;
    playbackValue.textContent = Math.floor(avgRate * 100) / 100;
  }, 2000);
}

/// =================== BPM =================== ///
function bpm() {
  var seconds = new Date().getTime();
  clicksPerMin = (1 / ((seconds - previousClick) / 1000)) * 60;
  previousClick = seconds;
  console.log(clicksPerMin);
  // console.log(Math.floor(clicksPerMin));
}
// If someone is not clicking, we reset the bpm otherwise, it stays set at the last value
function diminishBpm() {
  var seconds = new Date().getTime();
  if (seconds - previousClick > 500) {
    clicksPerMin = (1 / ((seconds - previousClick) / 1000)) * 60;
  }
  // console.log(Math.floor(clicksPerMin));
}

/// =================== UTILITIES =================== ///
function lerp(x, x0, x1, y0, y1) {
  let value = (y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0);
  if (value > y1) return y1;
  if (value < y0) return y0;
  return Math.floor(value * 10) / 10;
}

/// =================== SERIAL PORT =================== ///
async function getButtonPress() {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  while (port.readable) {
    const reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // |reader| has been canceled.
          break;
        }
        if (soundIsPlaying) bpm();
        // Do something with |value|...
      }
    } catch (error) {
      // Handle |error|...
      console.log(error);
    } finally {
      reader.releaseLock();
    }
  }
}
