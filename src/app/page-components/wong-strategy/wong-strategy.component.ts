import { Component, OnInit} from '@angular/core';
import { wong2MoreSpots, wong3MoreSpots, wong1MoreSpot, neverWong } from '../../default-configs/wonging-strategies';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageItemsEnum, WongStrategy } from '../../models';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

@Component({
  selector: 'wong-strategy',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './wong-strategy.component.html',
  styleUrl: './wong-strategy.component.scss'
})

export class WongStrategyComponent implements OnInit {

  activeStrategy: WongStrategy;
  activeStrategy$: BehaviorSubject<WongStrategy> = new BehaviorSubject<WongStrategy>(wong1MoreSpot);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Wonging Strategy";
  defaultStrategy: WongStrategy = { ...wong1MoreSpot };
  defaultStrategiesObj = {
    '1 More Spot': wong1MoreSpot,
    '2 More Spots': wong2MoreSpots,
    '3 More Spots': wong3MoreSpots, 
    'Never Wong': neverWong,
  };

  constructor() {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => this.activeStrategy = strategy);
  }

  addHand() {
    if(this.activeStrategy.wongedHands.length === 0) {
      this.activeStrategy.wongedHands.push({ enter: 0, exit: 0});
    } else {
      const lastIndex = this.activeStrategy.wongedHands.length - 1;
      const enter = this.activeStrategy.wongedHands[lastIndex].enter;
      const exit = this.activeStrategy.wongedHands[lastIndex].exit;
      this.activeStrategy.wongedHands.push({ enter, exit });
    }
  }

  deleteHand() {
    if(this.activeStrategy.wongedHands.length >= 0) {
      this.activeStrategy.wongedHands.pop();
    }
  }
}