import { Injectable } from '@angular/core';
import { Table } from './deviation-table';
import { DeviationInfo, LocalStorageItemsEnum } from '../models';
import { LocalStorageService } from '../services/local-storage.service';
import { UItoLogicService } from '../services/uiToLogic.service';
import { BehaviorSubject } from 'rxjs';
import { DeviationResults } from '../deviation-results/deviation-results';
import { PlayActionsEnum } from '../deviation-results/deviation-models';
import { DeviationChartService } from '../services/deviation-chart.service';

@Injectable({
  providedIn: 'root',
})

export class DeviationEngineService {
  showDeviationResultsSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showDeviationResults$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  table: Table;
  shared: any = {};
  deviationResults: DeviationResults;
  deviationData$: BehaviorSubject<DeviationResults> = new BehaviorSubject<DeviationResults>(null);
  
  constructor(
    public localStorageService: LocalStorageService,
    public deviationChartService: DeviationChartService,
    public uiToLogicService: UItoLogicService
  ) {}

  createTable(deviationInfo: DeviationInfo) {
    this.deviationResults = new DeviationResults(deviationInfo.handStage, deviationInfo.variableConditions, deviationInfo.chartKey);
    this.shared = {
      hideDeviationResultsSpinner: () => this.showDeviationResultsSpinner$.next(false),
      showDeviationResults: () => this.showDeviationResults$.next(true),
      incResultsAmountBet: (x: number, y: string, z: PlayActionsEnum) => this.incResultsAmountBet(x, y ,z),
      updateResultsAmountWon: (x: number, y: string, z: PlayActionsEnum) => this.updateResultsAmountWon(x, y, z),
      hasDeviationKey: (x: string) => this.hasDeviationKey(x),
      addNewResultKey: (x: string, y: PlayActionsEnum, z:number) => this.addNewResultKey(x, y, z),
      incResultsInstances: (x: string, z: PlayActionsEnum) => this.incResultsInstances(x, z),
    },
    this.table = new Table(deviationInfo, this.localStorageService, this.shared);
    console.log(this.deviationResults);
    // It about here that the deviationInfo results can be aggregated with local storage
    // Aggregtion of a chartKey combo can only go with chartkeys of the same handStage and exact variableConditions config
    // TODO
    // (1) retrieve LocalStorageItemsEnum.DEVIATION_CHART from local storage
    //    (A) If it does not exist in local storage, it should be added
    // (2) parse the chart 
    // (3) Retrieve the desired combo charts data based on the key made from the handStage and variableConditions - this key will be for an entire combo chart
    //    (A) if the key / value does not exist on the chart, it should be added
    // (4) check if the combo chart has the key for the newest deviation results (eg. "3-13")
    //    (A) if it does already exist, then create value, initialized to:
          // {
          //   instances: 0,
          //   amountBet: 0,
          //   amountWon: 0,
          // }
    //    (B) if it does exist or after it has been creates in 4A, then aggregate the new information
    // (5) Return the updated chart to local storage

    // const deviationResultInfoKeys: string[] = ['instances', 'amountBet', 'amountWon'];
    // let key: string = this.createLSMasterChartKey(deviationInfo);
    // let deviationCharts = this.localStorageService.getItem(LocalStorageItemsEnum.DEVIATION_CHART);
    // if(!deviationCharts[key]) {
    //   deviationCharts[key] = {
    //     [this.deviationResults.parentKey]: { ...this.deviationResults.results },
    //   }
    // } else {
    //   if(!deviationCharts[key][this.deviationResults.parentKey]) {
    //     deviationCharts[key][this.deviationResults.parentKey] = {} // These are not count keys yet
    //   }
    //   const countKeys = Object.keys(this.deviationResults.results);
    //   const firstCountKeys = Object.keys(this.deviationResults.results[countKeys[0]])
    //   console.log(firstCountKeys)
    //   console.log(countKeys)
    //   countKeys.forEach(countKey => {
    //     if(!deviationCharts[key][this.deviationResults.parentKey][countKey]) {
    //       deviationCharts[key][this.deviationResults.parentKey][countKey] = {};
    //       firstCountKeys.forEach(actionKey => deviationCharts[key][this.deviationResults.parentKey][countKey][actionKey] = {
    //         instances: 0,
    //         amountBet: 0,
    //         amountWon: 0,
    //       });
    //     }

    //     firstCountKeys.forEach(actionKey => deviationResultInfoKeys.forEach(driKey => {
    //       deviationCharts[key][this.deviationResults.parentKey][countKey][actionKey][driKey] += this.deviationResults.results[countKey][actionKey][driKey]
    //     }))
    //   });

      
    //   // NOW AGGREGATE THE RESULTS
    // }
    // console.log(deviationCharts)
    // this.localStorageService.setItem(LocalStorageItemsEnum.DEVIATION_CHART, deviationCharts);

    this.deviationChartService.aggregateDeviationResults(deviationInfo, this.deviationResults);
  }

  

  incResultsInstances(key: string, action: PlayActionsEnum): void {
    this.deviationResults.incResultsInstances(key, action);
  }

  incResultsAmountBet(amount: number, key: string, action: PlayActionsEnum): void {
    this.deviationResults.incResultsAmountBet(amount, key, action);
  }

  updateResultsAmountWon(amount: number, key: string, action: PlayActionsEnum): void {
    this.deviationResults.updateResultsAmountWon(amount, key, action);
  }

  hasDeviationKey(key: string): boolean {
    return !!this.deviationResults.results[key];
  }

  addNewResultKey(key: string, action: PlayActionsEnum, amountBet: number): void {
    this.deviationResults.addNewResultKey(key, action, amountBet);
  }
}