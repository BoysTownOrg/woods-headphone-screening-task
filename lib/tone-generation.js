export function pure(parameters) {
  return Array.from(
    { length: (parameters.sampleRate_Hz * parameters.duration_ms) / 1000 },
    (_value, index) =>
      Math.sin(
        (2 * Math.PI * parameters.frequency_Hz * index) /
          parameters.sampleRate_Hz
      )
  );
}