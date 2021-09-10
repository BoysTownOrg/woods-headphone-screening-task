import * as toneGeneration from "../lib/tone-generation.js";

jsPsych.plugins["play-tone"] = {
  info: {},
  trial(displayElement, trialParameters) {
    const audioContext = jsPsych.pluginAPI.audioContext();
    const audioBuffer = audioContext.createBuffer(1, 44100, 44100);
    const channel = audioBuffer.getChannelData(0);
    const parameters = {
      sampleRate_Hz: 44100,
      frequency_Hz: 200,
      duration_ms: 1000,
    };
    const ramp = toneGeneration.ramp({
      sampleRate_Hz: 44100,
      duration_ms: 100,
    });
    const tone = toneGeneration.multiplyFront(
      toneGeneration.multiplyBack(
        toneGeneration.pure(parameters),
        ramp.reverse()
      ),
      ramp
    );
    for (let i = 0; i < channel.length; i += 1) channel[i] = tone[i];
    while (displayElement.firstChild) {
      displayElement.removeChild(displayElement.lastChild);
    }
    const playButton = document.createElement("button");
    playButton.onclick = () => {
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
    };
    playButton.textContent = "play";
    displayElement.append(playButton);
    const exitButton = document.createElement("button");
    exitButton.onclick = () => {
      jsPsych.finishTrial();
    };
    exitButton.textContent = "exit";
    displayElement.append(exitButton);
  },
};
jsPsych.init({ timeline: [{ type: "play-tone" }] });
