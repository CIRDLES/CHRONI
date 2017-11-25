export class Numbers {
  static _unitConversions = {
    '': 0,

    // mass is stored in grams
    g: 0,
    mg: -3,
    μg: -6,
    ng: -9,
    pg: -12,
    fg: -15,

    // concentrations
    '\u0025': -2,
    '\u2030': -3,
    ppm: -6,
    ppb: -9,
    'g/g': 0,

    // dates are stored in years
    a: 0,
    ka: 3,
    Ma: 6,
    Ga: 9,

    // misc in % per amu
    '%/amu': -2
  };

  constructor() {}

  static getUnitConversions() {
    return this._unitConversions;
  }
}
