import * as toneGeneration from "../lib/tone-generation.js";

function playAudioBuffer(audioBuffer) {
  const audioContext = jsPsych.pluginAPI.audioContext();
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination);
  audioSource.start();
}

function createAudioBuffer(trialParameters) {
  const audioContext = jsPsych.pluginAPI.audioContext();
  return audioContext.createBuffer(
    2,
    (trialParameters.sampleRate_Hz * trialParameters.toneDuration_ms) / 1000,
    trialParameters.sampleRate_Hz
  );
}

function createPlayAudioButton(
  parent,
  text,
  trialParameters,
  tone,
  leftChannelMultiplier,
  rightChannelMultiplier
) {
  const button = document.createElement("button");
  button.onclick = () => {
    const audioBuffer = createAudioBuffer(trialParameters);
    const leftChannel = audioBuffer.getChannelData(0);
    for (let i = 0; i < leftChannel.length; i += 1)
      leftChannel[i] = leftChannelMultiplier * tone[i];
    const rightChannel = audioBuffer.getChannelData(1);
    for (let i = 0; i < rightChannel.length; i += 1)
      rightChannel[i] = rightChannelMultiplier * tone[i];
    playAudioBuffer(audioBuffer);
  };
  button.textContent = text;
  parent.append(button);
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
    },
  },
  trial(displayElement, trialParameters) {
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
    while (displayElement.firstChild)
      displayElement.removeChild(displayElement.lastChild);
    const leftChannel = toneGeneration.concatenateWithSilence(
      tone,
      toneGeneration.concatenateWithSilence(
        tone,
        tone.map((x) => x / 2),
        {
          sampleRate_Hz: trialParameters.sampleRate_Hz,
          silenceDuration_ms: 500,
        }
      ),
      {
        sampleRate_Hz: trialParameters.sampleRate_Hz,
        silenceDuration_ms: 500,
      }
    );
    const rightChannel = toneGeneration.concatenateWithSilence(
      tone,
      toneGeneration.concatenateWithSilence(
        tone.map((x) => -x),
        tone.map((x) => x / 2),
        {
          sampleRate_Hz: trialParameters.sampleRate_Hz,
          silenceDuration_ms: 500,
        }
      ),
      {
        sampleRate_Hz: trialParameters.sampleRate_Hz,
        silenceDuration_ms: 500,
      }
    );
    const button = document.createElement("button");
    button.onclick = () => {
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
      playAudioBuffer(audioBuffer);
    };
    button.textContent = "play all three";
    displayElement.append(button);
    createPlayAudioButton(
      displayElement,
      "play in phase",
      trialParameters,
      tone,
      1,
      1
    );
    createPlayAudioButton(
      displayElement,
      "play out of phase",
      trialParameters,
      tone,
      1,
      -1
    );
    createPlayAudioButton(
      displayElement,
      "play quiet",
      trialParameters,
      tone,
      1 / 2,
      1 / 2
    );
    const exitButton = document.createElement("button");
    exitButton.onclick = () => {
      jsPsych.finishTrial();
    };
    exitButton.textContent = "exit";
    displayElement.append(exitButton);
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
    },
  ],
});
