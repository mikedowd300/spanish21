import { CountingStrategy, TrueCountType } from "../models";

export const hiLo: CountingStrategy = {
  title: 'Hi Lo', 
  count: {
    'A': -1,
    '2': 1,
    '3': 1,
    '4': 1,
    '5': 1,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    'J': -1,
    'Q': -1,
    'K': -1,
  },
  runningCountStartsAt: 0,
  trueCountPreference: TrueCountType.FULL_FLOOR,
};

export const Ace5: CountingStrategy = {
  title: 'Ace 5', 
  count: {
    'A': -1,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 1,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    'J': 0,
    'Q': 0,
    'K': 0,
  },
  runningCountStartsAt: 0,
  trueCountPreference: TrueCountType.FULL_FLOOR,
};

export const NoCount: CountingStrategy = {
  title: 'No Count', 
  count: {
    'A': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    'J': 0,
    'Q': 0,
    'K': 0,
  },
  runningCountStartsAt: 0,
  trueCountPreference: TrueCountType.FULL_FLOOR,
};

export const countTitles: string[] = ['Hi Lo', 'Ace 5', 'No Count'];

export const defaultCounts: { [k: string]: CountingStrategy } = {
  'Hi Lo': hiLo, 
  'Ace 5': Ace5, 
  'No Count': NoCount,
};
