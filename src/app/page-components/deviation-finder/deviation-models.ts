import { DoubleDownOnEnum } from "../../models";

export enum HandStageEnum {
  FIRST_2_CARDS = 'First 2 Cards',
  AFTER_DOUBLING = 'After a Double',
  AFTER_REDOUBLING = 'After a Redouble',
  AFTER_REREDOUBLING = 'After a Reredouble',
  AFTER_HITTING = 'After a Hit',
}

export interface DeviationCondition {
  description: string;
  value: boolean | DoubleDownOnEnum;
}

export interface DeviationTableConditions {
  RSA: DeviationCondition,
  DAS: DeviationCondition,
  DoubleOn: DeviationCondition,
  RD: DeviationCondition,
  RRD: DeviationCondition,
}

export interface BonusException {
  name: string;
  description: string;
  value: boolean;
  displayWhenComboIs: string;
}

export const InitialDeviationTableConditions: DeviationTableConditions = {
  RSA: {
    description: 'Resplit Aces',
    value: true,
  },
  DAS: {
    description: 'Double After Split',
    value: true,
  },
  DoubleOn: {
    description: 'Can Double On Rule',
    value: DoubleDownOnEnum.DA2,
  },
  RD: {
    description: 'ReDoubling Allowed',
    value: true,
  },
  RRD: {
    description: 'ReReDoubling Allowed',
    value: true,
  },
};

export interface CondensedDeviationTableCondition {
  RSA: boolean;
  DAS: boolean;
  DD: DoubleDownOnEnum;
  RD: boolean;
  RRD: boolean;
}

export const BonusExceptions: BonusException[] = [
  {
    name: 'X67',
    description: 'Exclude 6,7 from player combos',
    value: false,
    displayWhenComboIs: '13',
  },
  {
    name: 'X77',
    description: 'Exclude 7,7 from player combos',
    value: false,
    displayWhenComboIs: '77',
  },
  {
    name: 'X68',
    description: 'Exclude 6,8 from player combos',
    value: false,
    displayWhenComboIs: '14',
  },
 {
    name: 'X78',
    description: 'Exclude 7,8 from player combos',
    value: false,
    displayWhenComboIs: '15',
  },
  {
    name: 'X67U',
    description: 'Exclude suited 6,7 from player combos',
    value: false,
    displayWhenComboIs: '13',
  },
  {
    name: 'X77U',
    description: 'Exclude suited 7,7 from player combos',
    value: false,
    displayWhenComboIs: '77',
  },
  {
    name: 'X68U',
    description: 'Exclude suited 6,8 from player combos',
    value: false,
    displayWhenComboIs: '14',
  },
 {
    name: 'X78U',
    description: 'Exclude suited 7,8 from player combos',
    value: false,
    displayWhenComboIs: '15',
  },
  {
    name: 'X67S',
    description: 'Exclude spaded 6,7 from player combos',
    value: false,
    displayWhenComboIs: '13',
  },
  {
    name: 'X77S',
    description: 'Exclude spaded 7,7 from player combos',
    value: false,
    displayWhenComboIs: '77',
  },
  {
    name: 'X68S',
    description: 'Exclude spaded 6,8 from player combos',
    value: false,
    displayWhenComboIs: '14',
  },
 {
    name: 'X78S',
    description: 'Exclude spaded 7,8 from player combos',
    value: false,
    displayWhenComboIs: '15',
  },
  {
    name: 'X13',
    description: 'Exclude non-bonusable 13s',
    value: false,
    displayWhenComboIs: '13',
  },
  {
    name: 'X14',
    description: 'Exclude non-bonusable 13s',
    value: false,
    displayWhenComboIs: '14',
  },
  {
    name: 'X15',
    description: 'Exclude non-bonusable 14s',
    value: false,
    displayWhenComboIs: '15',
  },
];

export const LegalActionsMap = {
  [HandStageEnum.FIRST_2_CARDS]: ['Hit', 'Stay', 'Double', 'Split', 'Surrender'],
  [HandStageEnum.AFTER_DOUBLING]: ['Stay', 'ReDouble', 'Split', 'Rescue'],
  [HandStageEnum.AFTER_REDOUBLING]: ['Stay', 'ReReDouble', 'Rescue'],
  [HandStageEnum.AFTER_REREDOUBLING ]: ['Stay', 'Rescue'],
  [HandStageEnum.AFTER_HITTING]: ['Hit', 'Stay', 'Double', 'Surrender'],
};

export const exceptionTypes = ['X67', 'X77', 'X68', 'X78', 'X67U', 'X77U', 'X68U', 'X78U', 'X67S', 'X77S', 'X68S', 'X78S', 'X13', 'X14', 'X15']