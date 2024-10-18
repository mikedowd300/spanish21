import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { LocalStorageService } from '../services/local-storage.service';
import { DeviationInfo, LocalStorageItemsEnum } from '../models';
import { DeviationResults } from '../deviation-results/deviation-results';

@Injectable({
  providedIn: 'root'
})
export class DeviationChartService {
  
  chart: Chart;
  activeChartDataKey: string;
  deviationData;
  roiByActionData;
  chartDataKeys: string[] = [];

  constructor(public localStorageService: LocalStorageService) { }

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

    aggregateDeviationResults(info: DeviationInfo, results: DeviationResults) { 
      // DeviationResults is a Class not an interface
      const deviationResultInfoKeys: string[] = ['instances', 'amountBet', 'amountWon'];
      let key: string = this.createLSMasterChartKey(info);
      this.activeChartDataKey = key;
      let deviationChartData = this.localStorageService.getItem(LocalStorageItemsEnum.DEVIATION_CHART);
      if(!deviationChartData[key]) {
        deviationChartData[key] = {
          [results.parentKey]: { ...results.results },
        }
      } else {
        if(!deviationChartData[key][results.parentKey]) {
          deviationChartData[key][results.parentKey] = {} // These are not count keys yet
        }
        const countKeys = Object.keys(results.results);
        const firstCountKeys = Object.keys(results.results[countKeys[0]])
        console.log(firstCountKeys)
        console.log(countKeys)
        countKeys.forEach(countKey => {
          if(!deviationChartData[key][results.parentKey][countKey]) {
            deviationChartData[key][results.parentKey][countKey] = {};
            firstCountKeys.forEach(actionKey => deviationChartData[key][results.parentKey][countKey][actionKey] = {
              instances: 0,
              amountBet: 0,
              amountWon: 0,
            });
          }
          firstCountKeys.forEach(actionKey => deviationResultInfoKeys.forEach(driKey => {
            deviationChartData[key][results.parentKey][countKey][actionKey][driKey] += results.results[countKey][actionKey][driKey]
          }))
        });
      }
      console.log(deviationChartData)
      this.localStorageService.setItem(LocalStorageItemsEnum.DEVIATION_CHART, deviationChartData);
    }

    getDeviationData() {
      this.deviationData = this.localStorageService.getItem(LocalStorageItemsEnum.DEVIATION_CHART);
      this.chartDataKeys = Object.keys(this.deviationData);
      console.log(this.chartDataKeys );
      return this.deviationData
    }

    setActiveChartDataKey(key: string): void {
      this.activeChartDataKey = key;
    }

    setRoiByActionData() {
      console.log(this.deviationData[this.activeChartDataKey]);
    }

    private createLSMasterChartKey(info: DeviationInfo): string {
      const conditions = Object.keys(info.variableConditions)
        .map(key => `${key}-${info.variableConditions[key]}`).join('-');
      return (`${info.handStage}-${conditions}`).replaceAll(' ', '_');
    }
}