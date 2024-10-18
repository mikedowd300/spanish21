import { TippingStrategy } from "../models";

export const cheapTipper: TippingStrategy = {
  title: "Cheap Tipper",
  tipToBetsizeRatios: [ [1, 50], [2, 500] ],
  maxTip: 2,
  afterBlackjack: true,
  dealerJoins: true,
  dealerLeaves: true,
  tipFirstHandOfShoe: false,
  playerIncreasesBet: false,
  everyXHands: null,
  tipSplitHandToo: false,
  doubleOnDouble: false,
  tipWongHands: false
};

export const generousTipper: TippingStrategy = {
  title: "Generous Tipper",
  tipToBetsizeRatios: [ [1, 25], [2, 50], [3, 100], [5, 250], [10, 500], [25, 1000] ],
  maxTip: 50,
  afterBlackjack: true,
  dealerJoins: true,
  dealerLeaves: true,
  tipFirstHandOfShoe: true,
  playerIncreasesBet: true,
  everyXHands: 10, 
  tipSplitHandToo: true,
  doubleOnDouble: true,
  tipWongHands: true
};

export const neverTip: TippingStrategy = {
  title: "Never Tips",
  tipToBetsizeRatios: [],
  maxTip: 0,
  afterBlackjack: false,
  dealerJoins: false,
  dealerLeaves: false,
  tipFirstHandOfShoe: false,
  playerIncreasesBet: false,
  everyXHands: null, 
  tipSplitHandToo: false,
  doubleOnDouble: false,
  tipWongHands: false
};

export const tippingTitles: string[] = [
  "Cheap Tipper", 
  "Generous Tipper", 
  "Never Tips"
];

export const defaultTippings: { [k: string]: TippingStrategy } = {
  "Cheap Tipper": cheapTipper, 
  "Generous Tipper": generousTipper, 
  "Never Tips": neverTip,
}