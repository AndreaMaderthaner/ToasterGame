let audioContext = new AudioContext();
let frequencies = [110, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
let playerOne = {};
let playerTwo = {};

function assignFrequencies(player) {
  let selectedFrequencies = [...frequencies];
  return shuffleArray(selectedFrequencies).slice(
    0,
    Math.round(frequencies.length - player.consumption / 100 + 1)
  );
}

function getEnergyConsumption() {
  return Math.round(Math.random() * (1000 - 100) + 100);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function playFrequency(frequency) {
  // create 2 second worth of audio buffer, with single channels and sampling rate of your device.
  let sampleRate = audioContext.sampleRate;
  let duration = 2 * sampleRate;
  let numChannels = 1;
  let buffer = audioContext.createBuffer(numChannels, duration, sampleRate);
  // fill the channel with the desired frequency's data
  let channelData = buffer.getChannelData(0);
  for (let i = 0; i < sampleRate; i++) {
    channelData[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
  }

  // create audio source node.
  let source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  // finally start to play
  source.start(0);
}

$(document).ready(function () {
  $("#start").click(function () {
    playerOne.consumption = getEnergyConsumption();
    playerTwo.consumption = getEnergyConsumption();
    playerOne.frequencies = assignFrequencies(playerOne);
    playerTwo.frequencies = assignFrequencies(playerTwo);
    playerOne.index = playerTwo.index = 0;

    $("#energyOne").text(playerOne.consumption);
    $("#energyTwo").text(playerTwo.consumption);
    $("#tonesOne").text(playerOne.frequencies.length);
    $("#tonesTwo").text(playerTwo.frequencies.length);

    $(".action").removeClass("hide");
  });

  $(window).bind("keypress", function (e) {
    if (e.keyCode == 97) {
      playFrequency(
        playerOne.frequencies[playerOne.index++ % playerOne.frequencies.length]
      );
    }

    if (e.keyCode == 106) {
      playFrequency(
        playerTwo.frequencies[playerTwo.index++ % playerTwo.frequencies.length]
      );
    }
  });
});
