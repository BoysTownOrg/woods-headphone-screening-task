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

function squared(x) {
  return x * x;
}

export function ramp(parameters) {
  const length = (parameters.sampleRate_Hz * parameters.duration_ms) / 1000;
  return Array.from({ length }, (_value, index) =>
    squared(Math.sin((Math.PI * index) / 2 / length))
  );
}

export function multiplyFront(multiplicand, multiplier) {
  for (let i = 0; i < multiplier.length; i += 1)
    multiplicand[i] *= multiplier[i];
  return multiplicand;
}
