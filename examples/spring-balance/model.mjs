// Original educational model. SI units are used for the calculation.
export const springLimits = Object.freeze({
  forceMin: 0, forceMax: 12, forceStep: 0.5,
  stiffnessMin: 100, stiffnessMax: 600, stiffnessStep: 25,
});

export const springPresets = Object.freeze([
  { id: 'baseline', label: 'Baseline: 6 N', forceN: 6, stiffnessNm: 300 },
  { id: 'double-force', label: 'Double force', forceN: 12, stiffnessNm: 300 },
  { id: 'double-stiffness', label: 'Double stiffness', forceN: 6, stiffnessNm: 600 },
  { id: 'zero-force', label: 'Zero force', forceN: 0, stiffnessNm: 300 },
]);

/** Static equilibrium of an ideal, linear extension spring; no dynamics. */
export function springState(forceN, stiffnessNm) {
  if (!Number.isFinite(forceN) || !Number.isFinite(stiffnessNm)) {
    throw new TypeError('Force and stiffness must be finite numbers.');
  }
  if (forceN < springLimits.forceMin || forceN > springLimits.forceMax ||
      stiffnessNm < springLimits.stiffnessMin || stiffnessNm > springLimits.stiffnessMax) {
    throw new RangeError('Values are outside this demonstration’s stated range.');
  }
  const extensionM = forceN / stiffnessNm;
  return { forceN, stiffnessNm, extensionM, extensionMm: extensionM * 1000 };
}
