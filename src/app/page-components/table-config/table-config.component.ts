import { AfterViewInit, Component, OnInit} from '@angular/core';
import { defaultTable } from '../../default-configs/table-config';
import { 
  allDefaultConditions, 
  conditionTitles 
} from '../../default-configs/conditions';
import { playerTitles } from '../../default-configs/player-config';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Conditions, LocalStorageItemsEnum, TableConfig } from '../../models';
import { 
  StrategySelectorComponent 
} from '../../shared-components/strategy-selector/strategy-selector.component';
import { LocalStorageService } from './../../services/local-storage.service';

@Component({
  selector: 'table-config',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './table-config.component.html',
  styleUrl: './table-config.component.scss'
})

export class TableConfigComponent implements AfterViewInit, OnInit {

  activeStrategy: TableConfig;
  activeStrategy$: BehaviorSubject<TableConfig> = new BehaviorSubject<TableConfig>(defaultTable);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Add, Edit or Delete a Table Configuration";
  defaultStrategy: TableConfig = { ...defaultTable };
  defaultStrategiesObj = { 'Default Table': defaultTable };
  conditionsTitles: string[] = [ ...conditionTitles];
  allPlayers: string[] = [];
  availablePlayers: string[] = [];
  tableSpots$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  spotsPerTable: number;

  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit(): void {
    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
      this.getSpotsPerTable(strategy.conditionsTitle);
    });
    this.getStrategies();
    this.allPlayers = this.getAllPlayers();
    this.availablePlayers = this.getAvailablePlayers();
  }

  ngAfterViewInit() {
    this.getSpotsPerTable(this.activeStrategy.conditionsTitle);
    setTimeout(() => this.tableSpots$.next(this.createTable(this.spotsPerTable)))
  }

  getStrategies(): void {
    const stored = this.localStorageService.getItem(LocalStorageItemsEnum.CONDITIONS) || {};
    const storedTitles = Object.keys(stored).length > 0 
      ? Object.keys(stored)
      : []
    this.conditionsTitles = [...this.conditionsTitles, ...storedTitles];
  }

  getAllPlayers(): string[] {
    const stored = this.localStorageService.getItem(LocalStorageItemsEnum.PLAYER_CONFIG) || {};
    const storedTitles = Object.keys(stored).length > 0 
      ? Object.keys(stored)
      : []
    return [...playerTitles, ...storedTitles]; 
  }

  getAvailablePlayers(): string[] {
    const activePlayers = this.activeStrategy.players
      .map(p => p.playerConfigTitle);
    return this.allPlayers.filter(p => !activePlayers.includes(p))
  }

  handleSelectConditionsTitle({ target }) {
    this.activeStrategy.conditionsTitle = target.value;
    this.getSpotsPerTable(target.value);
  }

  createTable(spotsPerTable: number): any {
    let spots = [];
    const { players } = this.activeStrategy;
    const takenSpots = players.map(p => p.seatNumber);
    const findPlayerBySpotNumber = n => players.find(p => p.seatNumber === n);
    for(let s = 0; s < spotsPerTable; s++) {
      let spot = { seatNumber: null, playerConfigTitle: "" };
      if(takenSpots.includes(s + 1)) {
        spots.push(findPlayerBySpotNumber(s + 1))
      } else {
        spots.push({ ...spot })
      }
    }
    return spots;
  }

  getSpotsPerTable(val: string):void {
    let spotsPerTable = null;
    let conditions: Conditions = null;
    const isFromLS = !conditionTitles.includes(val);
    if(!isFromLS) {
      // conditions = allDefaultConditions.find(c => c.title === val);
      conditions = allDefaultConditions[val];
      spotsPerTable = 
        conditions?.spotsPerTable || allDefaultConditions[0].spotsPerTable;
    } else {
      const stored = this.localStorageService.getItem(LocalStorageItemsEnum.CONDITIONS);
      spotsPerTable = stored?.[val]?.spotsPerTable || allDefaultConditions[0].spotsPerTable;
    }
    this.spotsPerTable = spotsPerTable;
    this.tableSpots$.next(this.createTable(spotsPerTable));
  }

  addPlayerToSpot({ target }, seatNumber) {
    this.activeStrategy.players.push({ 
      seatNumber, 
      playerConfigTitle: target.value 
    });
    this.availablePlayers = this.getAvailablePlayers();
    this.tableSpots$.next(this.createTable(this.spotsPerTable));
  }

  removeFromSeat(playerTitle, index) {
    this.activeStrategy.players = this.activeStrategy.players
      .filter(p => p.playerConfigTitle !== playerTitle);
    this.availablePlayers = this.getAvailablePlayers();
    this.tableSpots$.next(this.createTable(this.spotsPerTable));
  }
}