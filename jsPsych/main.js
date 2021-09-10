import * as toneGeneration from "../lib/tone-generation.js";

jsPsych.plugins["play-tone"] = {
  info: {},
  trial(displayElement, trialParameters) {
    const audioContext = jsPsych.pluginAPI.audioContext();
    const parameters = {
      sampleRate_Hz: 44100,
      frequency_Hz: 200,
      duration_ms: 1000,
    };
    const tone = toneGeneration.multiplyFront(
      toneGeneration.multiplyBack(
        toneGeneration.pure(parameters),
        toneGeneration
          .ramp({
            sampleRate_Hz: 44100,
            duration_ms: 100,
          })
          .reverse()
      ),
      toneGeneration.ramp({
        sampleRate_Hz: 44100,
        duration_ms: 100,
      })
    );
    while (displayElement.firstChild) {
      displayElement.removeChild(displayElement.lastChild);
    }
    const playInPhaseButton = document.createElement("button");
    playInPhaseButton.onclick = () => {
      const audioBuffer = audioContext.createBuffer(2, 44100, 44100);
      const leftChannel = audioBuffer.getChannelData(0);
      for (let i = 0; i < leftChannel.length; i += 1) leftChannel[i] = tone[i];
      const rightChannel = audioBuffer.getChannelData(1);
      for (let i = 0; i < rightChannel.length; i += 1)
        rightChannel[i] = tone[i];
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
    };
    playInPhaseButton.textContent = "play in phase";
    displayElement.append(playInPhaseButton);
    const playOutOfPhaseButton = document.createElement("button");
    playOutOfPhaseButton.onclick = () => {
      const audioBuffer = audioContext.createBuffer(2, 44100, 44100);
      const leftChannel = audioBuffer.getChannelData(0);
      for (let i = 0; i < leftChannel.length; i += 1) leftChannel[i] = tone[i];
      const rightChannel = audioBuffer.getChannelData(1);
      for (let i = 0; i < rightChannel.length; i += 1)
        rightChannel[i] = -tone[i];
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
    };
    playOutOfPhaseButton.textContent = "play out of phase";
    displayElement.append(playOutOfPhaseButton);
    const playQuietButton = document.createElement("button");
    playQuietButton.onclick = () => {
      const audioBuffer = audioContext.createBuffer(2, 44100, 44100);
      const leftChannel = audioBuffer.getChannelData(0);
      for (let i = 0; i < leftChannel.length; i += 1)
        leftChannel[i] = tone[i] / 2;
      const rightChannel = audioBuffer.getChannelData(1);
      for (let i = 0; i < rightChannel.length; i += 1)
        rightChannel[i] = tone[i] / 2;
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
    };
    playQuietButton.textContent = "play quiet";
    displayElement.append(playQuietButton);
    const exitButton = document.createElement("button");
    exitButton.onclick = () => {
      jsPsych.finishTrial();
    };
    exitButton.textContent = "exit";
    displayElement.append(exitButton);
  },
};
jsPsych.init({ timeline: [{ type: "play-tone" }] });
