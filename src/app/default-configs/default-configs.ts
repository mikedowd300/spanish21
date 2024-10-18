import { LocalStorageItemsEnum } from './../models';
import { betSpreadTitles, defaultBetSpreads } from './bet-spread-strategies';
import { conditionTitles, allDefaultConditions } from './conditions';
import { countTitles, defaultCounts } from './count-strategies';
import { playTitles, defaultPlay } from './play-strategies';
import { playerTitles, defaultPlayers } from './player-config';
import { tableTitles, defaultTables } from './table-config';
import { tippingTitles, defaultTippings } from './tipping-strategies';
import { unitResizingTitles, defaultUnitResaizings } from './unit-resize-strategies';
import { wongingTitles, defaultWongings } from './wonging-strategies';

export const strategyConfigStorageEnumMap = {
  [LocalStorageItemsEnum.BET_SPREAD]: defaultBetSpreads,
  [LocalStorageItemsEnum.CONDITIONS]: allDefaultConditions,
  [LocalStorageItemsEnum.COUNT]: defaultCounts,
  [LocalStorageItemsEnum.PLAY]: defaultPlay,
  [LocalStorageItemsEnum.PLAYER_CONFIG]: defaultPlayers,
  [LocalStorageItemsEnum.TABLE_CONFIG]: defaultTables,
  [LocalStorageItemsEnum.TIPPING]: defaultTippings,
  [LocalStorageItemsEnum.UNIT_RESIZE]: defaultUnitResaizings,
  [LocalStorageItemsEnum.WONG]: defaultWongings,
}