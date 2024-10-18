import { Component, OnInit} from '@angular/core';
import { hiLo, Ace5 } from '../../default-configs/count-strategies';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageItemsEnum, CountingStrategy } from '../../models';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

@Component({
  selector: 'count-strategy',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './count-strategy.component.html',
  styleUrl: './count-strategy.component.scss'
})

export class CountStrategyComponent implements OnInit {

  activeStrategy: CountingStrategy;
  activeStrategy$: BehaviorSubject<CountingStrategy> = new BehaviorSubject<CountingStrategy>(hiLo);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Counting Strategy";
  defaultStrategy: CountingStrategy = { ...hiLo };
  defaultStrategiesObj = { 
    'Hi Lo': hiLo,
    'Ace 5': Ace5
  };

  firstCards: string[] = [];
  middleCards: string[] = [];
  lastCards: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      this.firstCards = ['A', '2', '3', '4'];
      this.middleCards = ['5', '6', '7', '8'];
      this.lastCards = ['9', 'J', 'Q', 'K'];
    });
  }
}





