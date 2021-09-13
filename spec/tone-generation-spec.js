import {
  pure,
  ramp,
  multiplyFront,
  multiplyBack,
  concatenateWithSilence,
} from "../lib/tone-generation.js";

function squared(x) {
  return x * x;
}

describe("tone generation", () => {
  it("generates pure tones", () => {
    const tone = pure({
      sampleRate_Hz: 44100,
      frequency_Hz: 200,
      duration_ms: 1000,
    });
    expect(tone.slice(0, 5)).toEqual([
      Math.sin(2 * Math.PI * 200 * 0),
      Math.sin((2 * Math.PI * 200 * 1) / 44100),
      Math.sin((2 * Math.PI * 200 * 2) / 44100),
      Math.sin((2 * Math.PI * 200 * 3) / 44100),
      Math.sin((2 * Math.PI * 200 * 4) / 44100),
    ]);
    expect(tone.length).toEqual(44100);
  });

  it("generates ramps", () => {
    const signal = ramp({ sampleRate_Hz: 44100, duration_ms: 100 });
    expect(signal.slice(0, 5)).toEqual([
      squared(Math.sin((Math.PI * 0) / 8820)),
      squared(Math.sin((Math.PI * 1) / 8820)),
      squared(Math.sin((Math.PI * 2) / 8820)),
      squared(Math.sin((Math.PI * 3) / 8820)),
      squared(Math.sin((Math.PI * 4) / 8820)),
    ]);
    expect(signal.length).toEqual(4410);
  });

  it("multiplies signals together", () => {
    expect(multiplyFront([1, 2, 3, 4, 5], [6, 7, 8])).toEqual([
      1 * 6,
      2 * 7,
      3 * 8,
      4,
      5,
    ]);

    expect(multiplyBack([1, 2, 3, 4, 5], [6, 7, 8])).toEqual([
      1,
      2,
      3 * 6,
      4 * 7,
      5 * 8,
    ]);
  });

  it("concatenates signals with silence between", () => {
    expect(
      concatenateWithSilence([1, 2, 3], [4, 5, 6], {
        sampleRate_Hz: 8,
        silenceDuration_ms: 500,
      })
    ).toEqual([1, 2, 3, 0, 0, 0, 0, 4, 5, 6]);
  });
});
