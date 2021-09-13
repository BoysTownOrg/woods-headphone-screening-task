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

export function multiplyBack(multiplicand, multiplier) {
  for (let i = 0; i < multiplier.length; i += 1)
    multiplicand[i + multiplicand.length - multiplier.length] *= multiplier[i];
  return multiplicand;
}

export function concatenateWithSilence(first, second, parameters) {
  return first.concat(
    new Array((parameters.sampleRate_Hz * parameters.silenceDuration_ms) / 1000)
      .fill(0)
      .concat(second)
  );
}
