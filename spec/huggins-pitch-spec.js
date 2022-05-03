import { phaseInvert } from "../lib/huggins-pitch.js";

describe("huggins pitch", () => {
  it("tbd", () => {
    const inverted = phaseInvert(
      [
        { real: 1, imag: 0 },
        { real: -2, imag: 3 },
        { real: 4, imag: -5 },
        { real: -6, imag: 7 },
        { real: 8, imag: -9 },
        { real: -10, imag: 11 },
        { real: 12, imag: 0 },
        { real: -10, imag: -11 },
        { real: 8, imag: 9 },
        { real: -6, imag: -7 },
        { real: 4, imag: 5 },
        { real: -2, imag: -3 },
      ],
      {
        sampleRate_Hz: 24,
        centerFrequency_Hz: 6,
        bandwidth_Hz: 4,
      }
    );
    expect(inverted).toEqual([
      { real: 1, imag: 0 },
      { real: -2, imag: 3 },
      { real: -4, imag: 5 },
      { real: 6, imag: -7 },
      { real: -8, imag: 9 },
      { real: -10, imag: 11 },
      { real: 12, imag: 0 },
      { real: -10, imag: -11 },
      { real: -8, imag: -9 },
      { real: 6, imag: 7 },
      { real: -4, imag: -5 },
      { real: -2, imag: -3 },
    ]);
  });
});
