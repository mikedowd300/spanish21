import { Component, OnInit } from '@angular/core';
import { resizeReduceRisk, neverResize } from '../../default-configs/unit-resize-strategies';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

import { 
  LocalStorageItemsEnum, 
  UnitResizeStrategy, 
  ChipTypeEnum, 
  RoundingMethod 
} from '../../models';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'unit-resize-strategy',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './unit-resize-strategy.component.html',
  styleUrl: './unit-resize-strategy.component.scss'
})

export class UnitResizeStrategyComponent implements OnInit {

  roundingMethod = RoundingMethod;
  chipTypeEnum = ChipTypeEnum;
  activeStrategy: UnitResizeStrategy;
  activeStrategy$: BehaviorSubject<UnitResizeStrategy> = new BehaviorSubject<UnitResizeStrategy>(resizeReduceRisk);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Unit Resizing Strategy";
  defaultStrategy: UnitResizeStrategy =  { ...resizeReduceRisk };
  defaultStrategiesObj = {
    'Resize Reduce Risk': resizeReduceRisk,
    'Never Resize': neverResize, 
  };

  constructor() {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      console.log(this.activeStrategy);
    });
  }

  setRoundTo(chipType: ChipTypeEnum): void {
    this.activeStrategy.roundToNearest = chipType;
  }

  setRoundingMethod(method: RoundingMethod) {
    this.activeStrategy.roundingMethod = method
  }

  addRow(): void {
    const len = this.activeStrategy.unitProgression.length - 1;
    if(len > 0) {
      const unitProgressionValue = this.activeStrategy.unitProgression[len] + 1;
      const increaseAtMultiple = this.activeStrategy.increaseAtMultiple[len - 1];
      const decreaseAtMultiple = this.activeStrategy.decreaseAtMultiple[len];
      this.activeStrategy.unitProgression.push(unitProgressionValue);
      this.activeStrategy.increaseAtMultiple.push(null);
      this.activeStrategy.increaseAtMultiple[len] = increaseAtMultiple;
      this.activeStrategy.decreaseAtMultiple.push(decreaseAtMultiple || increaseAtMultiple);
    } else {
      this.activeStrategy.unitProgression.push(1);
      this.activeStrategy.increaseAtMultiple.push(null);
      this.activeStrategy.decreaseAtMultiple.push(this.activeStrategy.increaseAtMultiple[0]);
    }
  }

  deleteRow(): void {
    const len = this.activeStrategy.unitProgression.length - 1;
    if(len > 0) {
      this.activeStrategy.unitProgression.pop();
      this.activeStrategy.increaseAtMultiple.pop();
      this.activeStrategy.decreaseAtMultiple.pop(); 
    }
  }
}




