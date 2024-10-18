import { UnitResizeStrategy, ChipTypeEnum, RoundingMethod } from "../models";

export const resizeReduceRisk: UnitResizeStrategy = {
  title: 'Resize Reduce Risk',
  unitProgression: [
    1, 1.2, 1.4, 1.6, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10
  ],
  increaseAtMultiple: [
    1000, 1200, 1700, 2200, 2900, 4000, 5000, 7200, 8800, 10500, 14000, 18000, 22500, null
  ],
  decreaseAtMultiple: [
    null, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700, 2900, 3100, 3300
  ],
  roundToNearest: ChipTypeEnum.RED,
  roundingMethod: RoundingMethod.UP
};

export const neverResize: UnitResizeStrategy  = {
  title: 'Never Resize',
  unitProgression: [1],
  increaseAtMultiple: [],
  decreaseAtMultiple: [],
  roundToNearest: ChipTypeEnum.RED,
  roundingMethod: RoundingMethod.UP
};

export const unitResizingTitles: string[] = ['Resize Reduce Risk', 'Never Resize'];

export const defaultUnitResaizings: {  [k: string]: UnitResizeStrategy } = {
  'Resize Reduce Risk': resizeReduceRisk, 
  'Never Resize': neverResize,
};