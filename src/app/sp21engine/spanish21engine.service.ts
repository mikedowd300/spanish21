import { Injectable } from '@angular/core';
import { Table } from './table';
import { SimInfo } from '../models';
import { LocalStorageService } from '../services/local-storage.service';
import { UItoLogicService } from '../services/uiToLogic.service';

@Injectable({
  providedIn: 'root',
})

export class Spanish21EngineService {

  table: Table;
  shared: any = {};
  
  constructor(
    public localStorageService: LocalStorageService,
    public uiToLogicService: UItoLogicService
  ) {}

  createTable(simInfo: SimInfo) {
    this.shared = {
      outputResults: (x) => this.outputResults(x),
    };
    this.table = new Table(simInfo, this.localStorageService, this.shared);
    this.uiToLogicService.simData$.next(this.table.history.rounds);
  }

  outputResults(table: Table) {
    console.log(
      'HAND ID:', table.shoe.getHandId(),
      'DECKS REMAINING:', Math.round(table.shoe.getDecksRemaining() * 10) / 10, '\n',
    );
    table.players.forEach(p => console.log(
      'HANDLE: ', p.handle,
      'BANKROLL:', p.bankroll, '\n',
      'BETSIZE:', p.betSize,
      'TC:', p.getTrueCount()), '\n',
    )
  }
}