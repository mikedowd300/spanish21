import { Injectable } from '@angular/core';
import { SimInfo } from '../models';
import { BehaviorSubject } from 'rxjs';
import { TableRound } from '../history/history-models';

@Injectable({
  providedIn: 'root'
})
export class UItoLogicService {

  private nullInfo: SimInfo = { tableSkeleton: null, iterations: null };
  public simData$: BehaviorSubject<TableRound[]> = new BehaviorSubject<TableRound[]>(null);
  public deviationData$: BehaviorSubject<TableRound[]> = new BehaviorSubject<TableRound[]>(null);
  playerHandles: string[] = [];
  private simInfo: SimInfo = this.nullInfo;
  private allowNavigationToDashboard: boolean = false;
  public showDeviationResultsSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showDeviationResults$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  public setSimInfo(info: SimInfo): void {
    if(info) {
      this.setAllowNavigationToDashboard(true);
      this.playerHandles = info.tableSkeleton.players?.map(p => p.playerConfigTitle)
    }
    this.simInfo = { ...info }
  }

  public getSimInfo(): SimInfo {
    console.log(this.simInfo);
    return this.simInfo;
  }

  public setAllowNavigationToDashboard(allow: boolean): void {
    this.allowNavigationToDashboard = allow;
  }

  public getAllowNavigationToDashboard(): boolean {
    return this.allowNavigationToDashboard;
  }

  public setSimInfoToNullInfo() {
    this.simInfo = this.nullInfo;
  }
}