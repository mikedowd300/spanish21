import { Component, OnInit} from '@angular/core';
import { ploppy1, ploppy2 } from '../../default-configs/player-config';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './../../services/local-storage.service';
import { LocalStorageItemsEnum, PlayerConfig } from '../../models';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

import { betSpreadTitles } from '../../default-configs/bet-spread-strategies';
import { countTitles } from '../../default-configs/count-strategies';
import { playTitles } from '../../default-configs/play-strategies';
import { tippingTitles } from '../../default-configs/tipping-strategies';
import { unitResizingTitles } from '../../default-configs/unit-resize-strategies';
import { wongingTitles } from '../../default-configs/wonging-strategies';

@Component({
  selector: 'player-config',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './player-config.component.html',
  styleUrl: './player-config.component.scss'
})

export class PlayerConfigComponent implements OnInit {

  activeStrategy: PlayerConfig;
  activeStrategy$: BehaviorSubject<PlayerConfig> = new BehaviorSubject<PlayerConfig>(ploppy1);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Player Configuration";
  defaultStrategy: PlayerConfig = { ...ploppy1 };
  defaultStrategiesObj = {
    'Ploppy 1': ploppy1, 
    'Ploppy 2': ploppy2,
  };

  strategyLists = {
    [this.localStorageItemsEnum.PLAY]: playTitles,
    [this.localStorageItemsEnum.BET_SPREAD]: betSpreadTitles,
    [this.localStorageItemsEnum.UNIT_RESIZE]: unitResizingTitles,
    [this.localStorageItemsEnum.TIPPING]: tippingTitles,
    [this.localStorageItemsEnum.WONG]: wongingTitles,
    [this.localStorageItemsEnum.COUNT]: countTitles
  };

  selectLabels: string[] = [
    "Select a playing stratery",
    "Select a bet spreading strategy",
    "Select a unit resizing strategy",
    "Select a tipping strategy",
    "Select a wonging strategy",
    "Select a counting strategy"
  ];

  strategyTitles = [
    this.localStorageItemsEnum.PLAY,
    this.localStorageItemsEnum.BET_SPREAD,
    this.localStorageItemsEnum.UNIT_RESIZE,
    this.localStorageItemsEnum.TIPPING,
    this.localStorageItemsEnum.WONG,
    this.localStorageItemsEnum.COUNT
  ];

  titlePropertyMap = {
    [this.localStorageItemsEnum.PLAY]: 'playStrategyTitle',
    [this.localStorageItemsEnum.BET_SPREAD]: 'betSpreadStrategyTitle',
    [this.localStorageItemsEnum.UNIT_RESIZE]: 'unitResizingStrategyTitle',
    [this.localStorageItemsEnum.TIPPING]: 'tippngStrategyTitle',
    [this.localStorageItemsEnum.WONG]: 'wongingStrategyTitle',
    [this.localStorageItemsEnum.COUNT]: 'countStrategyTitle'
  }

  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      console.log(this.activeStrategy);
    });
    this.getStrategies();
  }

  selectStrategy({ target }, title: string) {
    this.activeStrategy[this.titlePropertyMap[title]] = target.value;
  }

  getStrategies(): void {
    Object.keys(this.strategyLists).forEach(title => {
      const stored = this.localStorageService.getItem(title) || {};
      const storedTitles = Object.keys(stored).length > 0 
        ? Object.keys(stored)
        : []
      this.strategyLists[title] = [...this.strategyLists[title], ...storedTitles];
    }) 
  }
}





