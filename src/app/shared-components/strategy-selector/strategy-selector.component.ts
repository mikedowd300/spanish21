import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageItemsEnum, AnyStrategy } from '../../models';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'strategy-selector',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, RouterLink ],
  templateUrl: './strategy-selector.component.html',
  styleUrl: './strategy-selector.component.scss'
})

export class StrategySelectorComponent implements OnInit {
  @ViewChild('newStrategy') newStrategy: ElementRef;
  @Input() title: string;
  @Input() defaultStrategiesObj: { [k: string]: any };
  @Input() defaultStrategy: any;
  @Input() strategyEnumType: LocalStorageItemsEnum;
  @Input() activeStrategy$: BehaviorSubject<AnyStrategy>;
  
  showSelectBox$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  showAddButton$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  showDeleteButton$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showSaveButton$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); 
  showEditableTitle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); 
  hasNewTitle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  activeStrategy: AnyStrategy; ;
  storedStrategies: any;
  strategyKeys: string[];
  allStrategiesObj = {}; 
  hardCodedStrategyKeys: string[];

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hardCodedStrategyKeys = Object.keys(this.defaultStrategiesObj);
    this.getStrategies();
  }

  getStrategies(): void {
    this.activeStrategy = { ...this.defaultStrategy };
    this.activeStrategy$.next(this.activeStrategy);
    this.storedStrategies = this.localStorageService.getItem(this.strategyEnumType) || {};
    if(this.storedStrategies) {
      this.allStrategiesObj = { ...this.defaultStrategiesObj, ...this.storedStrategies };
    }
    this.strategyKeys = Object.keys(this.allStrategiesObj);
  }

  selectStrategy({ target }): void {
    this.activeStrategy = { ...this.allStrategiesObj[target.value] };
    this.activeStrategy$.next(this.activeStrategy);
    const isFromLS = this.strategyKeys
      .filter(key => !this.hardCodedStrategyKeys.includes(key)) 
      .includes(this.activeStrategy.title);
    this.showDeleteButton$.next(isFromLS);
    this.showAddButton$.next(true);
    this.showSaveButton$.next(isFromLS);
  }

  deleteStrategy(): void {
    this.localStorageService.deleteStrategy( this.storedStrategies, this.activeStrategy.title, this.strategyEnumType);
    this.getStrategies();
    this.showDeleteButton$.next(false);
    this.showSaveButton$.next(false);
  }

  addStrategy(): void {
    this.showSelectBox$.next(false);
    this.showEditableTitle$.next(true);
    this.activeStrategy.title = '';
    this.showAddButton$.next(false);
    this.showDeleteButton$.next(false);
    this.showSaveButton$.next(false);
    setTimeout(() => this.newStrategy.nativeElement.focus());
  }

  handleTitleEdit(): void {
    this.hasNewTitle$.next(true);
    if(this.activeStrategy.title.length < 3) {
      this.showSaveButton$.next(false);
      this.hasNewTitle$.next(false);
    } else {
      this.showSaveButton$.next(true);
    } 
  }

  saveStrategy(): void {
    if(this.activeStrategy.title.length > 2) {
      this.localStorageService.saveStrategy(this.activeStrategy, this.storedStrategies, this.strategyEnumType);
      this.router.navigate(['/configurations']);
    }
  }
}





