import { trial } from "./trial.js";

function passed(results) {
  return (
    results.reduce((count, result) => count + (result.correct ? 1 : 0), 0) >= 5
  );
}

function createChild(parent, tagName) {
  const child = document.createElement(tagName);
  parent.append(child);
  return child;
}

function nextTrial(count, results) {
  trial(
    document.body,
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
      if (nextCount > 0) nextTrial(nextCount, results);
      else {
        const message = createChild(document.body, "div");
        if (passed(results)) message.textContent = "pass";
        else message.textContent = "fail";
      }
    }
  );
}

const results = [];
nextTrial(6, results);
