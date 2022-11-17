let audioContext = new AudioContext();

//let frequencies = [110, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
//let frequencies1 = [261.6256, 246.9417, 220.0, 195.9977];
//let frequencies2 = [261.6256, 293.6648, 329.6276, 349.2282];

// 4 frequencies:
// [0] -> up and down cancel each other out (perfect balance)
// [1] -> more button presses than needed (players are going to win)
// [2] -> not enough button presses (players are goint to lose)
// [3] -> actively wasting energy (toast already reached bottom of toaster)

let playerOne = [500, 100, 800, 50];
let playerTwo = [500, 100, 800, 50];

let readyToPlay = true;

let timeForANote = 1;

let consumption = 0;
let maxConsumption = 1000;

let move; // interval for moving the toast up (depending on consumption)
let speed = 0; // speed of the players' button clicks used to calculate if the are on the track of losing or winning

function getEnergyConsumption() {
  consumption = Math.round(Math.random() * (maxConsumption - 100) + 100);
}

function playFrequency(frequency) {
  readyToPlay = false;

  // create 2 second worth of audio buffer, with single channels and sampling rate of your device.

  //create 10 seconds worth of audio buffer
  let sampleRate = audioContext.sampleRate;
  let duration = timeForANote * sampleRate;
  let numChannels = 1;
  let buffer = audioContext.createBuffer(numChannels, duration, sampleRate);
  console.log(buffer);
  // fill the channel with the desired frequency's data
  let channelData = buffer.getChannelData(0);
  // change sampleRate to use duration instead becaue otherwise you don't fill the value in channelData buffer meaning you don't have the correct duration
  for (let i = 0; i < duration; i++) {
    channelData[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }

  // create audio source node.
  let source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  // finally start to play
  source.start(0);
  // just to give some time to play the sound
  setTimeout(() => {
    readyToPlay = true;
  }, 500);
}

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
    clearInterval(move);
    alert("Game over!");
  }
}

$(document).ready(function () {
  $("#start").click(function () {
    getEnergyConsumption();
    $("#consumption").text(consumption);
    $("#taps").text(Math.round(consumption * 0.1));
    $("#toast").css("margin-bottom", "-200px");
    $("#toast").css("margin-top", "300px");

    // calculate how fast the taost is moving up depending on household consumption
    let interval = 200 - Math.round(((consumption * 0.1) / 60) * 100);
    move = setInterval(moveToast, interval);

    $(".action").removeClass("hide");
  });

  $(window).bind("keypress", function (e) {
    //if (!readyToPlay) return;

    if (e.keyCode == 97) {
      playFrequency(playerOne[0]);
      moveToast(true);
    }

    if (e.keyCode == 106) {
      playFrequency(playerTwo[0]);
      moveToast(true);
    }
  });
});
