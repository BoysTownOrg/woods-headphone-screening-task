import "./plugin.js";

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
