import * as toneGeneration from "../lib/tone-generation.js";

function playAudioBuffer(audioBuffer) {
  const audioContext = jsPsych.pluginAPI.audioContext();
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination);
  audioSource.start();
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function createStimulus(tone, trialParameters, channelMultipliers) {
  return {
    leftChannel: toneGeneration.concatenateWithSilence(
      tone.map((x) => channelMultipliers[0].left * x),
      toneGeneration.concatenateWithSilence(
        tone.map((x) => channelMultipliers[1].left * x),
        tone.map((x) => channelMultipliers[2].left * x),
        {
          sampleRate_Hz: trialParameters.sampleRate_Hz,
          silenceDuration_ms: trialParameters.interstimulusInterval_ms,
        }
      ),
      {
        sampleRate_Hz: trialParameters.sampleRate_Hz,
        silenceDuration_ms: trialParameters.interstimulusInterval_ms,
      }
    ),
    rightChannel: toneGeneration.concatenateWithSilence(
      tone.map((x) => channelMultipliers[0].right * x),
      toneGeneration.concatenateWithSilence(
        tone.map((x) => channelMultipliers[1].right * x),
        tone.map((x) => channelMultipliers[2].right * x),
        {
          sampleRate_Hz: trialParameters.sampleRate_Hz,
          silenceDuration_ms: trialParameters.interstimulusInterval_ms,
        }
      ),
      {
        sampleRate_Hz: trialParameters.sampleRate_Hz,
        silenceDuration_ms: trialParameters.interstimulusInterval_ms,
      }
    ),
  };
}

jsPsych.plugins["play-tone"] = {
  info: {
    name: "play-tone",
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
    const tone = toneGeneration.multiplyFront(
      toneGeneration.multiplyBack(
        toneGeneration.pure({
          sampleRate_Hz: trialParameters.sampleRate_Hz,
          frequency_Hz: trialParameters.toneFrequency_Hz,
          duration_ms: trialParameters.toneDuration_ms,
        }),
        toneGeneration
          .ramp({
            sampleRate_Hz: trialParameters.sampleRate_Hz,
            duration_ms: trialParameters.toneRampDuration_ms,
          })
          .reverse()
      ),
      toneGeneration.ramp({
        sampleRate_Hz: trialParameters.sampleRate_Hz,
        duration_ms: trialParameters.toneRampDuration_ms,
      })
    );
    const channelMultipliers = new Array(3);
    const correctChoice = getRandomInt(3);
    const inPhasePrecedesOutOfPhase = getRandomInt(1) === 0;
    const inPhaseMultipliers = { left: 1, right: 1 };
    const outOfPhaseMultipliers = { left: 1, right: -1 };
    channelMultipliers[correctChoice] = { left: 1 / 2, right: 1 / 2 };
    let oneMultiplierPairRemaining = false;
    for (let i = 0; i < 3; i += 1) {
      if (i !== correctChoice) {
        if (oneMultiplierPairRemaining) {
          channelMultipliers[i] = inPhasePrecedesOutOfPhase
            ? outOfPhaseMultipliers
            : inPhaseMultipliers;
          break;
        } else {
          channelMultipliers[i] = inPhasePrecedesOutOfPhase
            ? inPhaseMultipliers
            : outOfPhaseMultipliers;
          oneMultiplierPairRemaining = true;
        }
      }
    }
    const { leftChannel, rightChannel } = createStimulus(
      tone,
      trialParameters,
      channelMultipliers
    );
    const playButton = document.createElement("button");
    const firstChoiceButton = document.createElement("button");
    firstChoiceButton.style.display = "none";
    firstChoiceButton.textContent = "FIRST sound is SOFTEST";
    const secondChoiceButton = document.createElement("button");
    secondChoiceButton.style.display = "none";
    secondChoiceButton.textContent = "SECOND sound is SOFTEST";
    const thirdChoiceButton = document.createElement("button");
    thirdChoiceButton.style.display = "none";
    thirdChoiceButton.textContent = "THIRD sound is SOFTEST";
    playButton.onclick = () => {
      const audioContext = jsPsych.pluginAPI.audioContext();
      const audioBuffer = audioContext.createBuffer(
        2,
        leftChannel.length,
        trialParameters.sampleRate_Hz
      );
      const leftChannel_ = audioBuffer.getChannelData(0);
      for (let i = 0; i < leftChannel_.length; i += 1)
        leftChannel_[i] = leftChannel[i];
      const rightChannel_ = audioBuffer.getChannelData(1);
      for (let i = 0; i < rightChannel_.length; i += 1)
        rightChannel_[i] = rightChannel[i];
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      playButton.style.display = "none";
      audioSource.onended = () => {
        firstChoiceButton.style.display = "";
        secondChoiceButton.style.display = "";
        thirdChoiceButton.style.display = "";
      };
      audioSource.start();
    };
    playButton.textContent = "play";
    displayElement.append(playButton);
    displayElement.append(firstChoiceButton);
    displayElement.append(secondChoiceButton);
    displayElement.append(thirdChoiceButton);
    firstChoiceButton.onclick = () => {
      jsPsych.finishTrial({ correct: correctChoice === 0 });
    };
    secondChoiceButton.onclick = () => {
      jsPsych.finishTrial({ correct: correctChoice === 1 });
    };
    thirdChoiceButton.onclick = () => {
      jsPsych.finishTrial({ correct: correctChoice === 2 });
    };
  },
};
jsPsych.init({
  timeline: [
    {
      type: "play-tone",
      sampleRate_Hz: 44100,
      toneFrequency_Hz: 200,
      toneDuration_ms: 1000,
      toneRampDuration_ms: 100,
      interstimulusInterval_ms: 500,
    },
  ],
});