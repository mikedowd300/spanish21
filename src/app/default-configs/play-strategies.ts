import { PlayStrategy } from "../models";
import { basicS17Strategy } from './play-strategies/basic-s17';
import { basicS17DDStrategy } from './play-strategies/basic-s17-dd';
import { basicH17Strategy } from './play-strategies/basic-h17';
import { basicH17DDStrategy } from './play-strategies/basic-h17-dd';
import { illustriousH17DDStrategy } from './play-strategies/illustrious-h17-dd';
import { illustriousH17Strategy } from './play-strategies/illustrious-h17';
import { illustriousS17Strategy } from './play-strategies/illustrious-s17';
import { illustriousS17DDStrategy } from './play-strategies/illustrious-s17-dd';
import { deviationFinder } from './play-strategies/deviation-finder';

export const playTitles: string[] = [
  "Basic H17 DD",
  "Basic H17", 
  "Basic S17 DD",
  "Basic S17",
  "Illustrious H17 DD",
  "illustrious H17",
  "illustrious S17 DD",
  "illustrious S17",
  "DeviationFinder",
];

export const defaultPlay: { [k: string]: PlayStrategy } = {
  "Basic H17 DD": basicH17DDStrategy,
  "Basic H17": basicH17Strategy,
  "Basic S17": basicS17Strategy,
  "Basic S17 DD": basicS17DDStrategy,
  "Illustrious H17 DD": illustriousH17DDStrategy,
  "illustrious H17": illustriousH17Strategy,
  "illustrious S17": illustriousS17Strategy,
  "illustrious S17 DD": illustriousS17DDStrategy,
  "deviationFinder": deviationFinder
};