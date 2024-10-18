import { WongStrategy } from "../models";

export const wong2MoreSpots: WongStrategy = {
  title: '2 More Spots',
  wongedHands: [
    { enter: 3, exit: 1 },
    { enter: 4, exit: 2 },
  ]
};

export const wong3MoreSpots: WongStrategy = {
  title: '3 More Spots',
  wongedHands: [
    { enter: 3, exit: 1 },
    { enter: 4, exit: 2 },
    { enter: 5, exit: 3 },
  ]
};

export const wong1MoreSpot: WongStrategy = {
  title: '1 More Spots',
  wongedHands: [
    { enter: 2, exit: 1 },
  ]
};

export const neverWong: WongStrategy = {
  title: 'Never Wong',
  wongedHands: [],
};

export const wongingTitles: string[] = [
  '2 More Spots', 
  '3 More Spots', 
  '1 More Spots', 
  'Never Wong'
];

export const defaultWongings: { [k: string]: WongStrategy } = {
  '2 More Spots': wong2MoreSpots, 
  '3 More Spots': wong3MoreSpots, 
  '1 More Spots': wong1MoreSpot, 
  'Never Wong': neverWong,
};