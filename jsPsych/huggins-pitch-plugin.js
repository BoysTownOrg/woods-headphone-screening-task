import * as toneGeneration from "../lib/tone-generation.js";
import { ComplexArray } from "https://cdn.jsdelivr.net/gh/BoysTownorg/jsfft@v0.0.5/lib/fft.js";
import { phaseInvert } from "../lib/huggins-pitch.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function createRamp(trialParameters) {
  return toneGeneration.ramp({
    sampleRate_Hz: trialParameters.sampleRate_Hz,
    duration_ms: trialParameters.rampDuration_ms,
  });
}

function pixelsString(a) {
  return `${a}px`;
}

function buttonElement() {
  const button = document.createElement("button");
  button.className = "jspsych-btn";
  button.style.margin = `${pixelsString(0)} ${pixelsString(8)}`;
  return button;
}

// https://stackoverflow.com/a/49434653
function randn_bm() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
}

function ramp(signal, trialParameters) {
  return toneGeneration.multiplyFront(
    toneGeneration.multiplyBack(signal, createRamp(trialParameters).reverse()),
    createRamp(trialParameters)
  );
}
function concatenateWithSilence(a, b, trialParameters) {
  return toneGeneration.concatenateWithSilence(a, b, {
    sampleRate_Hz: trialParameters.sampleRate_Hz,
    silenceDuration_ms: trialParameters.interstimulusInterval_ms,
  });
}

export class HeadphoneScreenPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trialParameters) {
    while (displayElement.firstChild)
      displayElement.removeChild(displayElement.lastChild);
    const choices = 3;
    const noiseLength =
      (trialParameters.sampleRate_Hz * trialParameters.noiseDuration_ms) / 1000;
    const noises = Array.from({ length: choices }, () =>
      Array.from({ length: noiseLength }, () => 2 * randn_bm() - 1)
    );
    const rampedNoises = noises.map((noise) => ramp(noise));
    const noiseDFTComplexArray = new ComplexArray(noiseLength)
      .map((value, index) => {
        value.real = noises[1][index];
      })
      .FFT();
    const noiseDFT = Array.from({ length: noiseLength }, (v, index) => ({
      real: noiseDFTComplexArray.real[index],
      imag: noiseDFTComplexArray.imag[index],
    }));
    const phaseInvertedNoiseDFT = phaseInvert(noiseDFT, {
      sampleRate_Hz: trialParameters.sampleRate_Hz,
      centerFrequency_Hz: trialParameters.centerFrequency_Hz,
      bandwidth_Hz: trialParameters.bandwidth_Hz,
    });
    const phaseInvertedNoiseComplexArray = new ComplexArray(noiseLength)
      .map((value, index) => {
        value.real = phaseInvertedNoiseDFT[index].real;
        value.imag = phaseInvertedNoiseDFT[index].imag;
      })
      .InvFFT();
    const phaseInvertedNoise = Array.from(
      { length: noiseLength },
      (v, index) => phaseInvertedNoiseComplexArray.real[index]
    );
    const rampedPhaseInvertedNoise = ramp(phaseInvertedNoise, trialParameters);
    const leftChannel = concatenateWithSilence(
      rampedNoises[0],
      rampedPhaseInvertedNoise,
      trialParameters
    );
    const rightChannel = concatenateWithSilence(
      rampedNoises[0],
      rampedNoises[1],
      trialParameters
    );
    const correctChoice = getRandomInt(choices);
    const playButton = buttonElement();
    playButton.textContent = "play";
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

HeadphoneScreenPlugin.info = {
  name: "headphone-screen",
  parameters: {
    sampleRate_Hz: {},
    centerFrequency_Hz: {},
    bandwidth_Hz: {},
    noiseDuration_ms: {},
    rampDuration_ms: {},
    interstimulusInterval_ms: {},
  },
};

if (typeof headphoneScreenPluginCallback !== "undefined") {
  headphoneScreenPluginCallback(HeadphoneScreenPlugin);
}
