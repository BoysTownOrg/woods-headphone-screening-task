import { pure, ramp } from "../lib/tone-generation.js";

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
      squared(Math.sin((Math.PI * 0) / 4410)),
      squared(Math.sin((Math.PI * 1) / 4410)),
      squared(Math.sin((Math.PI * 2) / 4410)),
      squared(Math.sin((Math.PI * 3) / 4410)),
      squared(Math.sin((Math.PI * 4) / 4410)),
    ]);
    expect(signal.length).toEqual(4410);
  });
});
