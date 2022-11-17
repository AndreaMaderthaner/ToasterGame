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
let consumption = 0;
let maxConsumption = 1000;
let canPlay = false; //for when the player loses or did not start the game yet

let move; // interval for moving the toast up (depending on consumption)
let speed = 0; // speed of the players' button clicks used to calculate if they are on the track of losing or winning
let time = 20; // Time to hold on
let downloadTimer;
function getEnergyConsumption() {
  consumption = Math.round(Math.random() * (maxConsumption - 100) + 100);
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

  let increment = direction ? -1 : 1;
  let reachedBottom = parseInt(bottom, 10) < -220;

  if (reachedBottom && direction) {
    // energy is wasted because toast is already within the toaster
    // TODO: change frequency to higher pitch
  } else if (parseInt(bottom, 10) < 0) {
    // speed is used to calculate if players will be winning or losing
    // if speed > 20 -> player is going to win, speed < -20 player is going to lose
    // speed inbetween 20 and - 20 means up and down movment cancel each other out (perfect balance)
    speed = direction ? speed + 1 : speed - 1;

    // TODO: change frequencies accordenly

    $("#toast").css("margin-bottom", parseInt(bottom, 10) + increment + "px");
    $("#toast").css("margin-top", parseInt(top, 10) - increment + "px");
  } else {
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
  clearInterval(move);
  clearInterval(downloadTimer);
  StopSound();
  canPlay = false;
}

$(document).ready(function () {
  $("#start").click(function () {
    // stop();
    playbackControl = document.querySelector(".playback-rate-control");
    playbackValue = document.querySelector(".playback-rate-value");
    playbackControl.setAttribute("disabled", "disabled");
    canPlay = true;
    getEnergyConsumption();
    $("#consumption").text(consumption);
    $("#taps").text(Math.round(consumption * 0.1));
    $("#toast").css("margin-bottom", "-200px");
    $("#toast").css("margin-top", "300px");

    // calculate how fast the toast is moving up depending on household consumption
    let interval = 200 - Math.round(((consumption * 0.1) / 60) * 100);
    move = setInterval(moveToast, interval);
    setTimeleft();
    StartSound();
    $(".action").removeClass("hide");
  });

  $(window).bind("keyup", function (e) {
    if (!canPlay) return;
    // console.log(e.keyCode);
    // if we use keypress : A = 97 and E = 106.
    // if we use keyup (so people can't stay pressing it) : A = 65 and E = 74.
    // No idea why...
    if (e.keyCode == 65) {
      // playFrequency(playerOne[0]);
      moveToast(true);
    }

    if (e.keyCode == 74) {
      // playFrequency(playerTwo[0]);
      moveToast(true);
    }
  });
});

/// =================== SOUND PART =================== ///
const audioCtx = new AudioContext();
let source;
let songLength;
// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

function getData() {
  source = new AudioBufferSourceNode(audioCtx);
  request = new XMLHttpRequest();

  request.open(
    "GET",
    "https://upload.wikimedia.org/wikipedia/commons/b/be/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg",
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
  source.start(0);
  playbackControl.removeAttribute("disabled");
}

function StopSound() {
  source.stop(0);
  playbackControl.setAttribute("disabled", "disabled");
}
