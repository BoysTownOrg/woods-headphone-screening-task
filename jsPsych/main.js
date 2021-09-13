import * as toneGeneration from "../lib/tone-generation.js";

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

function createRamp(trialParameters) {
  return toneGeneration.ramp({
    sampleRate_Hz: trialParameters.sampleRate_Hz,
    duration_ms: trialParameters.toneRampDuration_ms,
  });
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
        choiceButtons.style.display = "";
      };
      audioSource.start();
    };
    displayElement.append(playButton);
    displayElement.append(choiceButtons);
    const choiceNames = ["FIRST", "SECOND", "THIRD"];
    for (let i = 0; i < 3; i += 1) {
      const choiceButton = document.createElement("button");
      choiceButton.textContent = `${choiceNames[i]} sound is SOFTEST`;
      choiceButtons.append(choiceButton);
      choiceButton.onclick = () => {
        jsPsych.finishTrial({ correct: correctChoice === i });
      };
    }
  },
};
jsPsych.init({
  timeline: [
    {
      timeline: [
        {
          type: "headphone-screen-trial",
          sampleRate_Hz: 44100,
          toneFrequency_Hz: 200,
          toneDuration_ms: 1000,
          toneRampDuration_ms: 100,
          interstimulusInterval_ms: 500,
        },
      ],
      repetitions: 6,
    },
    {
      type: "html-keyboard-response",
      stimulus() {
        return `<p>You correctly answered ${jsPsych.data
          .get()
          .filter({ correct: true })
          .count()} trials.</p>
          <p>Press any key to exit.</p>`;
      },
    },
  ],
});
