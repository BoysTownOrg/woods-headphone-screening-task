export function phaseInvert(signal, parameters) {
  const frequencyResolution_Hz = parameters.sampleRate_Hz / signal.length;
  for (
    let frequency_Hz =
      parameters.centerFrequency_Hz - parameters.bandwidth_Hz / 2;
    frequency_Hz <= parameters.centerFrequency_Hz + parameters.bandwidth_Hz / 2;
    frequency_Hz += frequencyResolution_Hz
  ) {
    const index = frequency_Hz / frequencyResolution_Hz;
    signal[index].real *= -1;
    signal[index].imag *= -1;

    const conjugateIndex = signal.length - index;
    signal[conjugateIndex].real = signal[index].real;
    signal[conjugateIndex].imag = signal[index].imag * -1;
  }
  return signal;
}
