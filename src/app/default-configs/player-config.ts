import { PlayerConfig } from "../models";

export const ploppy1: PlayerConfig = {
  title: "Ploppy 1",
  description: "Just taking up space",
  initialBettingUnit: 25,
  initialBankroll: 100000000,
  playStrategyTitle: 'Basic H17',
  betSpreadStrategyTitle: 'Basic 1 to 6',
  unitResizingStrategyTitle: 'Never Resize',
  tippngStrategyTitle: 'Cheap Tipper',
  wongingStrategyTitle: 'Never Wong',
  countStrategyTitle: 'Hi Lo'
};

export const ploppy2: PlayerConfig = {
  title: "Ploppy 2",
  description: "Just eating cards",
  initialBettingUnit: 25,
  initialBankroll: 100000000,
  playStrategyTitle: 'Basic H17',
  betSpreadStrategyTitle: 'No Spread',
  unitResizingStrategyTitle: 'Resize Reduce Risk',
  tippngStrategyTitle: 'Never Tips',
  wongingStrategyTitle: 'Never Wong',
  countStrategyTitle: 'No Count'
};

export const playerTitles: string[] = ["Ploppy 1", "Ploppy 2"];

export const defaultPlayers: { [k: string]: PlayerConfig } = {
  "Ploppy 1": ploppy1,
  "Ploppy 2": ploppy2
};