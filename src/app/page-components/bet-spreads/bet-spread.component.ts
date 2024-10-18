import { Component, OnInit } from '@angular/core';
import { basic1to6, noSpread } from '../../default-configs/bet-spread-strategies';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageItemsEnum, BetSpreadStrategy, RoundingMethod, ChipTypeEnum } from '../../models';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

@Component({
  selector: 'betspread-strategy',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './bet-spread.component.html',
  styleUrl: './bet-spread.component.scss'
})

export class BetSpreadComponent implements OnInit {
  
  activeStrategy: BetSpreadStrategy;
  activeStrategy$: BehaviorSubject<BetSpreadStrategy> = new BehaviorSubject<BetSpreadStrategy>(basic1to6);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Bet Spreading Strategy";
  defaultStrategy: BetSpreadStrategy = { ...basic1to6 };
  defaultStrategiesObj = {
    'Basic 1 to 6': basic1to6, 
    'No Spread': noSpread,
  };
  roundingOptions: RoundingMethod[] = [RoundingMethod.DOWN, RoundingMethod.OFF];
  betRoundingOptions: ChipTypeEnum[] = [ChipTypeEnum.WHITE, ChipTypeEnum.RED];
  addTopRowText: string;
  deleteTopRowText: string;
  addBottomRowText: string;
  deleteBottomRowText: string;

  spreads: any[][] = [];

  constructor() {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      this.spreads = this.getSpreads();
      this.setText();
    });
  }

  setText() {
    this.addTopRowText = this.activeStrategy.useHalfCount ? 'Add 2 Top Rows' : 'Add Top Row';
    this.deleteTopRowText = this.activeStrategy.useHalfCount 
      ? 'Delete 2 Top Rows' 
      : 'Delete Top Row';
    this.addBottomRowText = this.activeStrategy.useHalfCount ? 'Add 2 Bottom Rows' : 'Add Bottom Row';
    this.deleteBottomRowText = this.activeStrategy.useHalfCount 
      ? 'Delete 2 Bottom Rows' 
      : 'Delete Bottom Row';
  }

  getSpreads(): any[][] {
    let sp: any[][] = [];
    Object.keys(this.activeStrategy.spreads)
      .map(key => parseFloat(key))
      .sort((a,b) => a - b)
      .map(key => key.toString())
      .forEach(key => sp.push([key, this.activeStrategy.spreads[key]]));
    return sp;
  }

  updateActiveStrategy(): void {
    console.log(this.spreads);
    console.log(this.activeStrategy.spreads);
    let newSpread = {};
    this.spreads.forEach(spread => newSpread[spread[0]] = spread[1])
    this.activeStrategy.spreads = { ...newSpread };
  }

  addTopSpread(): void {
    if(this.activeStrategy.useHalfCount) {
      const count = parseFloat(this.spreads[0][0]) - .5;
      const unit = this.spreads[0][1];
      this.spreads.unshift([count, unit]);
      this.spreads.unshift([count - .5, unit]);
      
    } else {
      const count = parseFloat(this.spreads[0][0]) - 1;
      const unit = this.spreads[0][1];
      this.spreads.unshift([count, unit]);
    }
    this.updateActiveStrategy()
  }

  deleteTopSpread(): void {
    if(this.spreads.length > 2 && this.activeStrategy.useHalfCount) {
      this.spreads.shift();
      this.spreads.shift();
    } else if(this.spreads.length > 1) {
      this.spreads.shift();
    }
    this.updateActiveStrategy();
  }

  addBottomSpread(): void {
    const len = this.spreads.length; 
    const unit = this.spreads[len - 1][1];
    if(this.activeStrategy.useHalfCount) {
      const count = parseFloat(this.spreads[len - 1][0]) + .5;
      this.spreads.push([count, unit]);
      this.spreads.push([count + .5, unit]);
    } else {
      const count = parseFloat(this.spreads[len - 1][0]) + 1;
      this.spreads.push([count, unit]);
    }
    this.updateActiveStrategy();
  }

  deleteBottomSpread(): void {
    if(this.spreads.length > 2 && this.activeStrategy.useHalfCount) {
      this.spreads.pop();
      this.spreads.pop();
    } else if(this.spreads.length > 1) {
      this.spreads.pop();
    }
    this.updateActiveStrategy();
  }

  handleRoundingPreference(option) {
    this.activeStrategy.roundingMethod = option;
  }

  handleBetRounding(option) {
    this.activeStrategy.roundBetToNearest = option;
  }

  adjustChart(): void {
    let spreadKeys = Object.keys(this.activeStrategy.spreads).map(key => parseFloat(key))
    let minCount = Math.min(...spreadKeys);
    let maxCount = Math.max(...spreadKeys);
    if(minCount % 1 !== 0) {
      minCount -= .5
    }
    if(maxCount % 1 !== 0) {
      maxCount += .5
    }
    const spreadByOneKeys = [];
    const spreadByHalfKeys = [];
    const spreadByOne = {};
    const spreadByHalf = {};
    for(let i = minCount; i <= maxCount; i++) {
      spreadByOneKeys.push(i);
      spreadByOne[i] = this.activeStrategy.spreads[i] || 0;
    }
    for(let i = minCount; i <= maxCount; i += .5) {
      spreadByHalfKeys.push(i);
      if(i % 1 === 0) {
        spreadByHalf[i] = this.activeStrategy.spreads[i] || 0;
      } else {
        spreadByHalf[i] = this.activeStrategy.spreads[i - .5] || 0;
      }
    }
    this.activeStrategy.spreads = this.activeStrategy.useHalfCount
      ? { ...spreadByHalf }
      : { ...spreadByOne }

    this.spreads = this.getSpreads();
    this.setText();
  }
}




