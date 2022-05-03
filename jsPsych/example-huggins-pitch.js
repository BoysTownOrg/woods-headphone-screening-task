import { HeadphoneScreenPlugin } from "./huggins-pitch-plugin.js";

const jsPsych = initJsPsych();
jsPsych.run([
  {
    timeline: [
      {
        type: HeadphoneScreenPlugin,
        sampleRate_Hz: 44100,
        centerFrequency_Hz: 600,
        bandwidth_Hz: 72,
        noiseDuration_ms: 1000,
        rampDuration_ms: 100,
        interstimulusInterval_ms: 500,
      },
    ],
    repetitions: 6,
  },
]);
