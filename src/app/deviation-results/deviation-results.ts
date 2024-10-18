import { 
  CondensedDeviationTableCondition, 
  HandStageEnum 
} from "../page-components/deviation-finder/deviation-models";
import { 
  DeviationResult, 
  DeviationResultByAction, 
  DeviationResultsObj, 
  PlayActionsEnum 
} from "./deviation-models";

export class DeviationResults {

  results: DeviationResultsObj = {};

  constructor(
    private stage: HandStageEnum, 
    private conditions: CondensedDeviationTableCondition,
    public parentKey: string,
  ){}

  addNewResultKey(key: string, action: PlayActionsEnum, amountBet: number) {
    this.results[key] = this.getNewDeviationResultByAction();
    this.results[key][action].instances += 1;
    this.results[key][action].amountBet += amountBet;
  }

  incResultsAmountBet(amountBet: number, key: string, action: PlayActionsEnum) {
    this.results[key][action].amountBet += amountBet;
  }

  updateResultsAmountWon(amount: number, key: string, action: PlayActionsEnum) {
    this.results[key][action].amountWon += amount;
  }

  incResultsInstances(key: string, action: PlayActionsEnum) {
    this.results[key][action].instances += 1;
  }

  private isSplittable(): boolean {
    const val = this.parentKey.split('-')[1];
    return this.parentKey !== '11' && (val.split('')[0] === val.split('')[1]);
  }

  private getNewDeviationResultByAction(): DeviationResultByAction {
    const newResult: DeviationResult = {
      instances: 0,
      amountBet: 0,
      amountWon: 0,
    };
    let players: DeviationResultByAction = {
      [PlayActionsEnum.STAY] : { ...newResult }, 
    }
    if(this.stage === HandStageEnum.FIRST_2_CARDS || this.stage === HandStageEnum.AFTER_HITTING) {
      players[PlayActionsEnum.HIT] = { ...newResult };
      players[PlayActionsEnum.DOUBLE] = { ...newResult };
    }
    if(this.stage === HandStageEnum.FIRST_2_CARDS && this.isSplittable()) {
      players[PlayActionsEnum.SPLIT] = { ...newResult };
    }; 
    if(this.stage === HandStageEnum.AFTER_DOUBLING && this.conditions.RD) {
      players[PlayActionsEnum.REDOUBLE] = { ...newResult };
    }
    if(this.stage === HandStageEnum.AFTER_REDOUBLING && this.conditions.RRD) {
      players[PlayActionsEnum.REREDOUBLE] = { ...newResult };
    }
    return players;
  }
}