let audioContext = new AudioContext();
// let frequencies = [110, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
let frequencies1 = [261.6256, 246.9417, 220.0, 195.9977];
let frequencies2 = [261.6256, 293.6648, 329.6276, 349.2282];

let playerOne = { noise: false };
let playerTwo = { noise: false };
const players = [playerOne, playerTwo];
let readyToPlay = true;

let timeForANote = 1;

let maxConsumption = 1000;

function noise(player) {
  players[player].noise = !players[player].noise;
}

function assignFrequencies(player, frequencies) {
  let selectedFrequencies = [...frequencies];
  //changed so that the number of notes is a percent of the player consumption
  return shuffleArray(selectedFrequencies).slice(
    0,
    Math.round((frequencies.length * player.consumption) / maxConsumption + 1)
  );
}

function getEnergyConsumption() {
  return Math.round(Math.random() * (maxConsumption - 100) + 100);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function playFrequency(frequency, player) {
  readyToPlay = false;

  // create 2 second worth of audio buffer, with single channels and sampling rate of your device.

  //create 10 seconds worth of audio buffer
  let sampleRate = audioContext.sampleRate;
  let duration = timeForANote * sampleRate;
  let numChannels = 1;
  let buffer = audioContext.createBuffer(numChannels, duration, sampleRate);
  // fill the channel with the desired frequency's data
  let channelData = buffer.getChannelData(0);
  // change sampleRate to use duration instead becaue otherwise you don't fill the value in channelData buffer meaning you don't have the correct duration
  for (let i = 0; i < duration; i++) {
    channelData[i] =
      Math.sin((2 * Math.PI * frequency * i) / sampleRate) +
      (player.noise
        ? Math.random(-0.5, 0.5) *
          Math.pow(player.consumption / maxConsumption, 2)
        : 0);
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

$(document).ready(function () {
  $("#start").click(function () {
    playerOne.consumption = getEnergyConsumption();
    playerTwo.consumption = getEnergyConsumption();
    playerOne.frequencies = assignFrequencies(playerOne, frequencies1);
    playerTwo.frequencies = assignFrequencies(playerTwo, frequencies2);
    playerOne.index = playerTwo.index = 0;

    $("#energyOne").text(playerOne.consumption);
    $("#energyTwo").text(playerTwo.consumption);
    $("#tonesOne").text(playerOne.frequencies.length);
    $("#tonesTwo").text(playerTwo.frequencies.length);

    $(".action").removeClass("hide");
  });

  $(window).bind("keypress", function (e) {
    if (!readyToPlay) return;
    if (e.keyCode == 97) {
      playFrequency(
        playerOne.frequencies[playerOne.index++ % playerOne.frequencies.length],
        playerOne
      );
    }

    if (e.keyCode == 106) {
      playFrequency(
        playerTwo.frequencies[playerTwo.index++ % playerTwo.frequencies.length],
        playerTwo
      );
    }
  });
});
