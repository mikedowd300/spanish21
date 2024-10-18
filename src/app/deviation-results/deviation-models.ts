export interface DeviationResult {
  instances: number;
  amountBet: number;
  amountWon: number
}

export enum PlayActionsEnum {
  STAY = 'stay',
  SPLIT = 'split',
  HIT = 'hit',
  DOUBLE = 'double',
  REDOUBLE = 'redouble',
  REREDOUBLE = 'reredouble',
}

export interface DeviationResultByAction {
  [PlayActionsEnum.STAY]?: DeviationResult;
  [PlayActionsEnum.SPLIT]?: DeviationResult;
  [PlayActionsEnum.HIT]?: DeviationResult;
  [PlayActionsEnum.DOUBLE]?: DeviationResult;
  [PlayActionsEnum.REDOUBLE]?: DeviationResult;
  [PlayActionsEnum.REREDOUBLE]?: DeviationResult;
}

export interface DeviationResultsObj {
  [k: string]: DeviationResultByAction
}