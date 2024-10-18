import { HandStageEnum } from "./page-components/deviation-finder/deviation-models";

export enum LocalStorageItemsEnum {
  SHOES = 'shoes',
  CONDITIONS = 'conditions',
  TIPPING = 'tipping',
  BET_SPREAD = 'betSpread',
  WONG = 'wong',
  UNIT_RESIZE = 'unitResize',
  PLAY = 'play',
  PLAYER_CONFIG = "playerConfig",
  TABLE_CONFIG = 'tableConfig',
  COUNT = 'count',
  DEVIATION_CHART = 'deviationChart',
}

export enum HandOptionEnums {
  HIT = 'hit',
  STAY = 'stay',
  SPLIT = 'split',
  DOUBLE = 'double',
  REDOUBLE = 'redouble',
  REREDOUBLE = 'reredouble',
  SURRENDER = 'surrender',
  RESCUE = 'rescue',
}

export enum SpotStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  TAKEN = 'taken',
}

export const cardValues: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'];

export interface ShoeConditions {
  decksPerShoe: number;
  cardsBurned: number;
  shufflePoint: number;
  countBurnCard: boolean;
}

export enum PayRatioEnum {
  THREE_to_ONE = '3/1',
  THREE_to_TWO = '3/2',
  SIX_to_FIVE = '6/5',
  TWO_to_ONE = '2/1',
  ONE_to_ONE = '1/1',
};

export enum HoleCardTypesEnum {
  STANDARD = 'Standard',
  OBO = 'OBO',
  ENHC = 'ENHC',
}

export enum DoubleDownOnEnum {
  DA2 = 'Double on any 2 Cards',
  DT11 = 'Double on hard 10 and 11 only',
  D911 = 'Double hard 9 through 11 only',
  D811 = 'Double hard 8 through 11 only',
}

export enum ChipTypeEnum {
  WHITE = "white",
  RED = "red",
}

export enum RoundingMethod {
  UP = "round up",
  DOWN = "round down",
  OFF = "round off",
}

export enum CountByEnum {
  // WE MIGHT NOT NEED THIS DOR SPANISH 21
  COUNT_BY_POINT_5 = 'Count by 1/2',
  COUNT_BY_1 = 'Count by 1',
}

export enum TrueCountType {
  HALF_FLOOR = 'halfFloor',
  HALF_ROUNDED = 'halfRounded',
  FULL_FLOOR = 'fullFloor',
  FULL_ROUNDED = 'fullRounded',
}

export interface PlayActionOptions {
  options: string;
  conditions: string;
}

export interface BetSpreadStrategy {
  title: string;
  spreads: { [k: string]: number };
  roundBetToNearest: ChipTypeEnum,
  roundingMethod: RoundingMethod,
  useHalfCount: boolean;
}

export interface CountingStrategy {
  title: string;
  count: {
    'A': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
    '6': number;
    '7': number;
    '8': number;
    '9': number;
    'J': number;
    'Q': number;
    'K': number;
  }
  runningCountStartsAt: number;
  trueCountPreference: TrueCountType;
};

export interface PlayStrategy {
  title: string;
  combos: { [k: string]: PlayActionOptions };
}

export interface TippingStrategy {
  title: string,
  tipToBetsizeRatios: number[][];
  maxTip: number;
  afterBlackjack: boolean;
  dealerJoins: boolean;
  dealerLeaves: boolean;
  tipFirstHandOfShoe: boolean;
  playerIncreasesBet: boolean;
  everyXHands: number;
  tipSplitHandToo: boolean;
  doubleOnDouble: boolean;
  tipWongHands: boolean;
};

export interface DeviationPlayerConfig {
  handle: string;
  resizeProgression: null;
  bettingUnit: number;
  progressiveBettingUnitIndex: null;
  bankroll: number;
  originalBankroll: number;
  playingStrategy: any;
  betSpreadingStrategy: null;
  unitResizingStrategy: null;
  wongingStrategy: null;
  tippingStrategy: null;
  countingStrategy: null;
  spotIds: number[];
  wongSpotIds: null;
  tipSize: null;
  tippedAway: null;
  totalBet: number;
  spotId: number;
  amountBetPerHand: number;
  hadBlackJackLastHand: null;
  betSizeLastHand: null;
  betSize: number;
  trueCountType: TrueCountType; 
  beginningTrueCount: number;
  history: any; // This will not be used or change into the object that collects the results from each hand
}

export interface PlayerConfig {
  title: string;
  description: string;
  initialBettingUnit: number;
  initialBankroll: number;
  playStrategyTitle: string;
  betSpreadStrategyTitle: string;
  unitResizingStrategyTitle: string;
  tippngStrategyTitle: string;
  wongingStrategyTitle: string;
  countStrategyTitle: string;
}

export interface PlayerTableInfo {
  seatNumber: number;
  playerConfigTitle: string;
}

export interface TableConfig {
  title: string;
  players: PlayerTableInfo[];
  conditionsTitle: string;
}

export interface Wong {
  enter: number,
  exit: number;
}

export interface WongStrategy {
  title: string;
  wongedHands: Wong[];
}

export interface UnitResizeStrategy {
  title: string,
  unitProgression: number[],
  increaseAtMultiple: number[],
  decreaseAtMultiple: number[],
  roundToNearest: ChipTypeEnum,
  roundingMethod: RoundingMethod
}

export type AnyStrategy = 
  | WongStrategy 
  | Conditions 
  | UnitResizeStrategy 
  | TippingStrategy 
  | BetSpreadStrategy
  | PlayStrategy
  | PlayerConfig
  | TableConfig
  | CountingStrategy

export interface Conditions {
  title?: string;
  S17: boolean;
  RSA: boolean;
  MHFS: number;
  DSA: boolean;
  RD: boolean;
  RRD: boolean;
  DS21: boolean;
  DFL: boolean;
  RDFL: boolean;
  DAS: boolean;
  MSE: boolean;
  LCD: boolean;
  reshuffleOnDealerChange: boolean;
  burnCardOnDealerChange: boolean;
  DD: DoubleDownOnEnum;
  payRatio: PayRatioEnum;
  payRatioFromAA: PayRatioEnum;
  canSurrenderAfterSplit: boolean;
  canRescueAfterSplit: boolean;
  LS: boolean;
  spotsPerTable: number;
  decksPerShoe: number;
  cardsBurned: number;
  minBet: number;
  maxBet: number;
  shufflePoint: number;
  countBurnCard: boolean;
  handsPerDealer: number;
}

export enum ConditionsEnum {
  title = 'title',
  SI7 = 'SI7',
  RSA = 'RSA',
  MHFS = 'MHFS',
  DSA = 'DSA',
  RD = 'RD',
  RRD = 'RRD',
  DS21 = 'DS21',
  DFL = 'DFL',
  RDFL= 'RDFL',
  DAS = 'DAS',
  MSE = 'MSE',
  LCD = 'LCD',
  reshuffleOnDealerChange = 'reshuffleOnDealerChange',
  burnCardOnDealerChange = 'burnCardOnDealerChange',
  payRatio = 'payRatio',
  payRatioFromAA = 'payRatioFromAA',
  canSurrenderAfterSplit = 'canSurrenderAfterSplit',
  canRescueAfterSplit = 'canRescueAfterSplit',
  LS = 'LS',
  spotsPerTable = 'spotsPerTable',
  decksPerShoe = 'decksPerShoe',
  cardsBurned = 'cardsBurned',
  minBet = 'minBet',
  maxBet = 'maxBet',
  shufflePoint = 'shufflePoint',
  countBurnCard = 'countBurnCard',
  handsPerDealer = 'handsPerDealer',
  DD = 'DD',
}

export enum InputTypeEnum {
  TEXT = "TEXT",
  NUMBER = "number",
  RADIO = "radio",
  RANGE = "range",
  CHECKBOX = "checkbox",
}

export interface RuleInput {
  description: string;
  why?: string;
  inputType: InputTypeEnum;
  min?: number;
  max?: number; 
  ruleName: ConditionsEnum;
  radioValues: any;
  displayInColumn?: boolean;
}

export interface SpotUIproperty {
  description: string;
  value: string | number;
}

export interface PlayStrategyCombo {
  [k: string]: {
    conditions: string,
    options: string;
  }
}

export interface SpotUIObj {
  title: SpotUIproperty;
  bankroll: SpotUIproperty;
  bettingUnit: SpotUIproperty;
  playStategy: SpotUIproperty;
  spreadStrategy: SpotUIproperty;
  tippingStrategy: SpotUIproperty;
  resizeStrategy: SpotUIproperty;
  wongingStrategy: SpotUIproperty;
  countingStratgey: SpotUIproperty;
}

export interface SimInfo {
  tableSkeleton: TableConfig | null;
  iterations: number | null;
}

export interface CondensedDeviationTableCondition {
  RSA: boolean;
  DAS: boolean;
  DD: DoubleDownOnEnum;
  RD: boolean;
  RRD: boolean;
}

export interface DeviationInfo {
  variableConditions?: CondensedDeviationTableCondition;
  exceptions?: string[];
  chartKey?: string;
  actions: string[];
  instances: number | null;
  handStage: HandStageEnum;
}

export interface DeviationTableConfig {
  title: string;
  players: PlayerTableInfo[];
  conditionsTitle: string;
  variableConditions?: {} | any;
  exceptions?: [];
  chartKey?: string;
  actions: string[];
  playStrategy: any;
}

export interface TableSpot {
  status: SpotStatus;
  controlledBy: string;
  id: number;
}

export interface TableSpotsInformation {
  spotsPertable: number;
  playerSpotMap: any;
}

export enum DoubleType {
  DOUBLE = 'double',
  REDOUBLE = 'redouble',
  REREDOUBLE = 'reredouble',
}

export enum HandOutcomeEnum {
  WON_WITH_BETTER_HAND = "Won with better hand",
  WON_BY_DEALER_BUST = "Won because dealer busted",
  PUSHED = "Pushed",
  BUSTED = "Busted",
  BLACKJACK = "Blackjack",
  LOST_TO_BETTER_HAND = "Lost to better hand",
  LOST_TO_BLACKJACK = "Lost to Dealer's Blackjack",
  SURRENDERED = "Surrendered",
  RESCUED = "Rescued",
}

export enum BonusTypeEnum {
  SIX_7_8 = '678',
  SUITED_6_7_8 = 'Suited 678',
  SPADED_6_7_8 = 'Spaded 678',
  TRIPLE_7S = 'Triple 7s',
  TRIPLE_7S_SUITED = 'Suited 7s',
  TRIPLE_7S_SPADED = 'Spaded 7s',
  SUPER_BONUS = 'Super Bonus'
}

export interface CardInfo {
  image: string;
  name: string;
}

export enum HandAction {
  HIT = 'hit',
  SPLIT = 'split',
  DOUBLE = 'double',
  REDOUBLE = 'redouble',
  REREDOUBLE = 'reredouble',
  INSURE = 'insure',
  SURRENDER = 'surrender',
  RESCUE = 'rescue',
}

export interface HandHistory {
  betSize?: number;
  cards?: CardInfo[];
  value?: number;
  actions?: HandAction[];
  outcome?: HandOutcomeEnum;
  winnings?: number;
  isFromSplit?: boolean;
  doubleType?: DoubleType | null;
  didSurrender?: boolean;
  wasRescued?: boolean;
  bonusType?: BonusTypeEnum | null;
  bonusFor21?: PayRatioEnum | null;
  isFromWong?: boolean;
  tipSize?: number;
}

export interface PlayerRoundHistory {
  spotIds: number[];
  hands: HandHistory[];
  bankroll: number;
  beginningTrueCount: number;
}