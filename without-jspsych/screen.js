import { trial } from "./trial.js";

function passed(results) {
  return (
    results.reduce((count, result) => count + (result.correct ? 1 : 0), 0) >= 5
  );
}

function nextTrial(parentElement, count, results, onPass, onFail) {
  trial(
    parentElement,
    {
      sampleRate_Hz: 44100,
      toneFrequency_Hz: 200,
      toneDuration_ms: 1000,
      toneRampDuration_ms: 100,
      interstimulusInterval_ms: 500,
    },
    (result) => {
      results.push(result);
      const nextCount = count - 1;
      if (nextCount > 0)
        nextTrial(parentElement, nextCount, results, onPass, onFail);
      else if (passed(results)) onPass();
      else onFail();
    }
  );
}

export function screen(parentElement, onPass, onFail) {
  const results = [];
  nextTrial(parentElement, 6, results, onPass, onFail);
}
