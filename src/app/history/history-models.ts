import { 
  CardInfo, 
  HandAction, 
  HandOutcomeEnum, 
  DoubleType, 
  BonusTypeEnum, 
  PayRatioEnum, 
  SpotStatus 
} from "../models";

export interface HandRound {
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

export interface ShoeRound {
  handId: string;
  hiLoRunningCount: number;
  hiLoTrueCountFloor: number;
  hiLoTrueCountRound: number;
  hiLoTrueCountHalfFloor: number;
  hiLoTrueCountHalfRound: number;
}

export interface SpotRound {
  status: SpotStatus,
  spotId: number,
  playerHandle: string,
  hands: HandRound[];
}

export interface PlayerRound {
  bettingUnit: number;
  handle: string;
  spotIds: number[];
  beginningBankroll: number;
  beginningTrueCount: number;
}

export interface DealerRound {
  cards: CardInfo[];
  value: number;
  hasBlackjack: boolean,
  didBust: boolean,
}

export interface TableRound {
  roundId: number;
  shoe: ShoeRound;
  spots: SpotRound[];
  players: PlayerRound[];
  dealer: DealerRound;
}