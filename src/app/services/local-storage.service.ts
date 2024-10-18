import { Injectable } from '@angular/core';
import { LocalStorageItemsEnum } from '../models';
import { strategyConfigStorageEnumMap } from '../default-configs/default-configs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  defaultStrategyMap = {
    [LocalStorageItemsEnum.CONDITIONS]: 'Default Conditions',
    [LocalStorageItemsEnum.TIPPING]: 'Never Tips',
    [LocalStorageItemsEnum.BET_SPREAD]: 'No Spread',
    [LocalStorageItemsEnum.WONG]: 'Never Wong',
    [LocalStorageItemsEnum.UNIT_RESIZE]: 'Never Resize',
    [LocalStorageItemsEnum.PLAY]: 'Basic H17',
    [LocalStorageItemsEnum.COUNT]: 'No Counts',
  }

  strategiesOfPlayer = [
    LocalStorageItemsEnum.TIPPING, 
    LocalStorageItemsEnum.BET_SPREAD, 
    LocalStorageItemsEnum.WONG, 
    LocalStorageItemsEnum.UNIT_RESIZE, 
    LocalStorageItemsEnum.PLAY, 
    LocalStorageItemsEnum.COUNT
  ];

  constructor() { }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string) {
    let item: string = localStorage.getItem(key) as string;
    if(item) {
      return JSON.parse(item);
    }
    this.setItem(key, {});
    item = localStorage.getItem(key) as string;
    return JSON.parse(item);
  }

  getItemOfItems(itemKey: LocalStorageItemsEnum, key: string) {
    const items = { ...this.getItem(itemKey), ...strategyConfigStorageEnumMap[itemKey] };
    return { ...items[key] };
  }

  deleteStrategy(storedStrategies, activeStrategyTitle: string, strategyEnum: LocalStorageItemsEnum): void {
    let filteredStrategies = {};
    const filteredStoredStrategiesTitles = Object.keys(storedStrategies)
      .filter(title => title !== activeStrategyTitle);
    filteredStoredStrategiesTitles.forEach(title => filteredStrategies[title] = storedStrategies[title]);
    this.setItem(strategyEnum, filteredStrategies);
    this.deleteStrategyFromPlayer(strategyEnum, activeStrategyTitle);
    this.deleteConditionFromTable(strategyEnum, activeStrategyTitle);
    this.deletePlayerFromTable(strategyEnum, activeStrategyTitle);
  }

  saveStrategy(activeStrategy, storedStrategies, strategyEnum: LocalStorageItemsEnum): void {
    if(activeStrategy.title.length > 2) {
      const newStrategy= { ...storedStrategies, [activeStrategy.title]: activeStrategy }
      this.setItem(strategyEnum, newStrategy);
    }
  }

  private deleteStrategyFromPlayer(targetEnum: LocalStorageItemsEnum, targetTitle: string) {
    if(this.strategiesOfPlayer.includes(targetEnum)) {
      const strategyPropertyMap = {
        [LocalStorageItemsEnum.TIPPING]: 'tippingStrategyTitle',
        [LocalStorageItemsEnum.BET_SPREAD]: 'betSpreadStrategyTitle',
        [LocalStorageItemsEnum.WONG]: 'wongingStrategyTitle',
        [LocalStorageItemsEnum.UNIT_RESIZE]: 'unitResizingStrategyTitle',
        [LocalStorageItemsEnum.PLAY]: 'playStrategyTitle',
        [LocalStorageItemsEnum.COUNT]: 'countStrategyTitle',
      }
      const targetProperty = strategyPropertyMap[targetEnum];
      const playersObj = this.getItem(LocalStorageItemsEnum.PLAYER_CONFIG);
      const playerTitles = Object.keys(playersObj);
      playerTitles.forEach(pt => {
        if(playersObj[pt][targetProperty] === targetTitle) {
          playersObj[pt][targetProperty] = this.defaultStrategyMap[targetEnum];
        }
      })
      this.setItem(LocalStorageItemsEnum.PLAYER_CONFIG, playersObj);
    }
  }

  private deleteConditionFromTable(targetEnum: LocalStorageItemsEnum, targetTitle: string) {
    if(targetEnum === LocalStorageItemsEnum.CONDITIONS) {
      const tablesObj = this.getItem(LocalStorageItemsEnum.TABLE_CONFIG);
      const tableTitles = Object.keys(tablesObj);
      tableTitles.forEach(tt => {
        if(tablesObj[tt]['conditionsTitle'] === targetTitle) {
          tablesObj[tt]['conditionsTitle'] = this.defaultStrategyMap[targetEnum];
        }
      })
      this.setItem(LocalStorageItemsEnum.TABLE_CONFIG, tablesObj);
    }
  }

  private deletePlayerFromTable(targetEnum: LocalStorageItemsEnum, targetTitle: string) {
    if(targetEnum === LocalStorageItemsEnum.PLAYER_CONFIG) {
      const tablesObj = this.getItem(LocalStorageItemsEnum.TABLE_CONFIG);
      const tableTitles = Object.keys(tablesObj);
      tableTitles.forEach(tt => {
        tablesObj[tt]['players'] = tablesObj[tt]['players']
          .filter(p => p.playerConfigTitle !== targetTitle)
      })
      this.setItem(LocalStorageItemsEnum.TABLE_CONFIG, tablesObj);
    }
  }
}
