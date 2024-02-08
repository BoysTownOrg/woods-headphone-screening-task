import * as toneGeneration from "../../lib/tone-generation.js";

import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function createChannel(
  tone,
  trialParameters: TrialType<Info>,
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

function createStimulus(tone, trialParameters: TrialType<Info>, channelMultipliers) {
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

function createRamp(trialParameters: TrialType<Info>) {
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

function pixelsString(a: number) {
  return `${a}px`;
}

function buttonElement() {
  const button = document.createElement("button");
  button.className = "jspsych-btn";
  button.style.margin = `${pixelsString(0)} ${pixelsString(8)}`;
  return button;
}

const info = <const>{
  name: "headphone-screen",
  parameters: {
    sampleRate_Hz: { type: ParameterType.FLOAT },
    toneFrequency_Hz: { type: ParameterType.FLOAT },
    toneDuration_ms: { type: ParameterType.FLOAT },
    toneRampDuration_ms: { type: ParameterType.FLOAT },
    interstimulusInterval_ms: { type: ParameterType.FLOAT },
  },
};

type Info = typeof info;

class HeadphoneScreenPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(displayElement: HTMLElement, trialParameters:TrialType<Info>) {
    displayElement.replaceChildren();
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
    const playButton = buttonElement();
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
      const audioContext = this.jsPsych.pluginAPI.audioContext();
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
      const choiceButton = buttonElement();
      choiceButton.textContent = `${choiceNames[i]} sound is SOFTEST`;
      choiceButtons.append(choiceButton);
      choiceButton.onclick = () => {
        this.jsPsych.finishTrial({ correct: correctChoice === i });
      };
    }
  }
}

export default HeadphoneScreenPlugin;
