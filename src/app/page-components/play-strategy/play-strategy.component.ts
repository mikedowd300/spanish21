import { Component, OnInit} from '@angular/core';
import { playTitles, defaultPlay } from '../../default-configs/play-strategies';
import { basicH17Strategy } from '../../default-configs/play-strategies/basic-h17';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageItemsEnum, PlayStrategy } from '../../models';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

@Component({
  selector: 'play-strategy',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './play-strategy.component.html',
  styleUrl: './play-strategy.component.scss'
})

export class PlayStrategyComponent implements OnInit {

  activeStrategy: PlayStrategy;
  activeStrategy$: BehaviorSubject<PlayStrategy> = new BehaviorSubject<PlayStrategy>(basicH17Strategy);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Playing Strategy";
  defaultStrategy: PlayStrategy = { ...basicH17Strategy };
  defaultStrategiesObj = {  ...defaultPlay }

  upCards: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
  playersCardsKey: string[] = [];
  keyColumns: string[][];

  constructor() {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      const { combos } = this.activeStrategy;
      const comboKeys = Object.keys(combos);
      this.playersCardsKey = comboKeys
        .filter(k => k.split('-').shift() === '2')
        .map(key => key.split('-').pop()); 
      this.keyColumns = this.upCards.map(card => this.getKeyColumnArray(card));
    });
  }

  getKeyColumnArray(card: string): string[] {
    let ray = [];
    this.playersCardsKey.forEach(key => ray.push(`${card}-${key}`));
    return ray;
  }
}