import * as toneGeneration from "../lib/tone-generation.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function createChannel(
  tone,
  trialParameters,
  channelMultipliers,
  toneMultiplierFromChannelMultiplier
) {
  return toneGeneration.concatenateWithSilence(
    tone.map(
      (x) => toneMultiplierFromChannelMultiplier(channelMultipliers[0]) * x
    ),
    toneGeneration.concatenateWithSilence(
      tone.map(
        (x) => toneMultiplierFromChannelMultiplier(channelMultipliers[1]) * x
      ),
      tone.map(
        (x) => toneMultiplierFromChannelMultiplier(channelMultipliers[2]) * x
      ),
      {
        sampleRate_Hz: trialParameters.sampleRate_Hz,
        silenceDuration_ms: trialParameters.interstimulusInterval_ms,
      }
    ),
    {
      sampleRate_Hz: trialParameters.sampleRate_Hz,
      silenceDuration_ms: trialParameters.interstimulusInterval_ms,
    }
  );
}

function createStimulus(tone, trialParameters, channelMultipliers) {
  return {
    leftChannel: createChannel(
      tone,
      trialParameters,
      channelMultipliers,
      (channelMultiplier) => channelMultiplier.left
    ),
    rightChannel: createChannel(
      tone,
      trialParameters,
      channelMultipliers,
      (channelMultiplier) => channelMultiplier.right
    ),
  };
}

function createRamp(trialParameters) {
  return toneGeneration.ramp({
    sampleRate_Hz: trialParameters.sampleRate_Hz,
    duration_ms: trialParameters.toneRampDuration_ms,
  });
}

// https://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

jsPsych.plugins["headphone-screen-trial"] = {
  info: {
    name: "headphone-screen-trial",
    description: "",
    parameters: {
      sampleRate_Hz: {},
      toneFrequency_Hz: {},
      toneDuration_ms: {},
      toneRampDuration_ms: {},
      interstimulusInterval_ms: {},
    },
  },
  trial(displayElement, trialParameters) {
    while (displayElement.firstChild)
      displayElement.removeChild(displayElement.lastChild);
    const choices = 3;
    const channelMultipliers = new Array(choices);
    const correctChoice = getRandomInt(choices);
    channelMultipliers[correctChoice] = { left: 1 / 2, right: 1 / 2 };
    const incorrectChoiceMultipliers = shuffle([
      { left: 1, right: 1 },
      { left: 1, right: -1 },
    ]);
    let incorrectChoiceIndex = 0;
    for (let i = 0; i < choices; i += 1)
      if (i !== correctChoice) {
        channelMultipliers[i] =
          incorrectChoiceMultipliers[incorrectChoiceIndex];
        incorrectChoiceIndex += 1;
      }
    const playButton = document.createElement("button");
    playButton.textContent = "play";
    const { leftChannel, rightChannel } = createStimulus(
      toneGeneration.multiplyFront(
        toneGeneration.multiplyBack(
          toneGeneration.pure({
            sampleRate_Hz: trialParameters.sampleRate_Hz,
            frequency_Hz: trialParameters.toneFrequency_Hz,
            duration_ms: trialParameters.toneDuration_ms,
          }),
          createRamp(trialParameters).reverse()
        ),
        createRamp(trialParameters)
      ),
      trialParameters,
      channelMultipliers
    );
    const choiceButtons = document.createElement("div");
    choiceButtons.style.display = "none";
    playButton.onclick = () => {
      const audioContext = jsPsych.pluginAPI.audioContext();
      const audioBuffer = audioContext.createBuffer(
        2,
        leftChannel.length,
        trialParameters.sampleRate_Hz
      );
      for (let i = 0; i < leftChannel.length; i += 1) {
        audioBuffer.getChannelData(0)[i] = leftChannel[i];
        audioBuffer.getChannelData(1)[i] = rightChannel[i];
      }
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      playButton.style.display = "none";
      audioSource.onended = () => {
        choiceButtons.style.display = "";
      };
      audioSource.start();
    };
    displayElement.append(playButton);
    displayElement.append(choiceButtons);
    const choiceNames = ["FIRST", "SECOND", "THIRD"];
    for (let i = 0; i < choices; i += 1) {
      const choiceButton = document.createElement("button");
      choiceButton.textContent = `${choiceNames[i]} sound is SOFTEST`;
      choiceButtons.append(choiceButton);
      choiceButton.onclick = () => {
        jsPsych.finishTrial({ correct: correctChoice === i });
      };
    }
  },
};
