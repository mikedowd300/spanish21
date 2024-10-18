import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { cheapTipper, generousTipper, neverTip } from '../../default-configs/tipping-strategies';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageItemsEnum, TippingStrategy } from '../../models';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

@Component({
  selector: 'tipping-strategy',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './tipping-strategy.component.html',
  styleUrl: './tipping-strategy.component.scss'
})

export class TippingStrategyComponent implements OnInit {
  @ViewChild('newStrategy') newStrategy: ElementRef;
  
  activeStrategy: TippingStrategy;
  activeStrategy$: BehaviorSubject<TippingStrategy> = new BehaviorSubject<TippingStrategy>(cheapTipper);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Tipping Strategy";
  defaultStrategy: TippingStrategy =  { ...cheapTipper };
  defaultStrategiesObj = { 
    'Cheap Tipper': cheapTipper,
    'Generous Tipper': generousTipper, 
    'Never Tips': neverTip,
  };

  // CONTENT SPECIFIC DATA
  howOftenTippingBooleanKeys: string[] = ['afterBlackjack', 'dealerJoins', 'dealerLeaves', 'tipFirstHandOfShoe', 'playerIncreasesBet'];
  howOftenTippingNumberKeys: string[] = ['everyXHands'];
  wongSplitDoubleTippingKeys: string[] = ['tipSplitHandToo', 'doubleOnDouble', 'tipWongHands'];
  keyDescriptionMap = {
    "afterBlackjack": "After a blackjack",
    "dealerJoins": "When a new dealer joins the table",
    "dealerLeaves": "When a dealer leaves the table",
    "tipFirstHandOfShoe": "The first hand of the shoe",
    "playerIncreasesBet": "When the player increases the bet",
    "everyXHands": ["every", "hands"],
    "tipSplitHandToo": "Add a tip when splitting a hand with a tip",
    "doubleOnDouble": "Double the tip when doubling",
    "tipWongHands": "Tip wonged hands",
  }

  constructor() {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      console.log(this.activeStrategy);
    });
  }

  addTippingPoint(): void {
    const { tipToBetsizeRatios } = this.activeStrategy;
    const newBreakpoint = tipToBetsizeRatios.length > 0 
      ? [
          tipToBetsizeRatios[tipToBetsizeRatios.length - 1][0] + 1,
          tipToBetsizeRatios[tipToBetsizeRatios.length - 1][1] + 1,
        ]
      : [1, 1]
    this.activeStrategy.tipToBetsizeRatios.push(newBreakpoint);
  }

  deleteTippingPoint(): void {
    this.activeStrategy.tipToBetsizeRatios.pop();
  }
}




