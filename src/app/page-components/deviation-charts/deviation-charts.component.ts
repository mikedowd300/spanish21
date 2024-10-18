import { Component, OnInit} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { dealerUpCards, playerFirst2 } from './../../utilities/chart-cards';
import { DeviationChartService } from './../../services/deviation-chart.service';
import { Chart, ChartItem, registerables } from 'chart.js';

@Component({
  selector: 'deviation-charts',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive ],
  templateUrl: './deviation-charts.component.html',
  styleUrl: './deviation-charts.component.scss'
})

export class DeviationChartsComponent implements OnInit {
  playerFirst2Combo: string[] = playerFirst2;
  selectedPlayersCards: string;
  charts: Chart[] = [];
  chartIds: string[] = [ ...dealerUpCards ];
  chartData
  mainKeys: string[];
  activeDataKey: string;
  outerDataKeys: string[];
  innerActionKeys: string[] = [];

  constructor(public chartService: DeviationChartService) {}

  ngOnInit(): void {
    this.chartData = this.chartService.getDeviationData();
    this.outerDataKeys = Object.keys(this.chartData);
    if(this.outerDataKeys.length === 1) {
      this.activeDataKey = this.outerDataKeys[0];
    }
    Chart.register(...registerables);
  }

  updatePlayersCards({ target }) { 
    this.chartIds = [ ...dealerUpCards ];
    this.selectedPlayersCards = target.value;
    this.charts.forEach(ch => ch.destroy())
    this.mainKeys = Object.keys(this.chartData[this.activeDataKey]).filter(k => k.split('-')[1] === this.selectedPlayersCards);
    const filteredDealersUpCards = this.getDealersUpcards();
    // this.chartIds = [ ...filteredDealersUpCards ];
    this.innerActionKeys = this.getInnerActionKeys();
    const sortedFilteredChartKeyObjects = this.getCountKeysByDealersUpcard(filteredDealersUpCards);
    console.log(sortedFilteredChartKeyObjects)
    filteredDealersUpCards.forEach(uc => {
      this.charts.push(this.createChart(uc, sortedFilteredChartKeyObjects[`${uc}-${this.selectedPlayersCards}`]))
    });
  }

  getInnerActionKeys(): string[] {
    // For now, at just the first 2 cards, Surrender will manually be added
    const countKey = Object.keys(this.chartData[this.activeDataKey][this.mainKeys[0]])[0];
    return [ ...Object.keys(this.chartData[this.activeDataKey][this.mainKeys[0]][countKey]), 'surrender' ];
  }

  getCountKeysByDealersUpcard(upCards: string[]) {
    const obj = {};
    upCards.forEach(c => obj[`${c}-${this.selectedPlayersCards}`] = this.getSortedCountKeyObjects(`${c}-${this.selectedPlayersCards}`))
    return obj;
  }

  getSortedCountKeyObjects(key: string) { // They lose their sorting
    const obj = {};
    const data = this.chartData[this.activeDataKey][key];
    Object.keys(data)
      .map(c => parseFloat(c))
      .sort((a, b) => a - b)
      .map(c => c.toString())
      .forEach(c => obj[c] = this.getActionDataObjects(key, c))
    console.log(obj)
    return obj;
  }

  getActionDataObjects(parentKey: string, countKey: string) {
    const obj = {};
    this.innerActionKeys.forEach(key => {
      if(key !== 'surrender') {
        obj[key] = {
          instances: this.chartData[this.activeDataKey][parentKey][countKey][key].instances,
          wonPerInstance: Math.round((this.chartData[this.activeDataKey][parentKey][countKey][key].amountWon * 100) / this.chartData[this.activeDataKey][parentKey][countKey][key].instances) / 100,
        }
      } else {
        obj[key] = {
          instances: 0,
          wonPerInstance: -50.00,
        }
      }
    })
    return obj;
  }

  updateActiveDataKey({ target }) {
    this.activeDataKey = target.value
  }

  getDealersUpcards(): string[] {
    const hasAce = this.mainKeys.map(k => k.split('-')[0]).includes('A');
    let cards: string[] = this.mainKeys
      .map(k => k.split('-')[0])
      .filter(c => c !== 'A')
      .map(c => parseInt(c))
      .sort((a, b) => a - b)
      .map(c => c.toString())
    // Why does cards.push('A') change cards to a number?
    return hasAce ? [ ...cards, 'A' ] : cards;
  }

  sortFilterCountKeys(countKeys: string[]): string[] {
    return countKeys
      .map(c => parseFloat(c))
      .filter(c => c < 11 && c > -11)
      .sort((a, b) => a - b)
      .map(c => c.toString())
  }

  makeLabels(countKeys: string[], chartData): string[] {
    return countKeys
      .map(c => parseFloat(c))
      .filter(c => c < 11 && c > -11)
      .sort((a, b) => a - b)
      .map(c => `${c} : ${this.getInstanceSums(chartData, c)}`)
  }

  getInstanceSums(data, c) {
    let sum = 0;
    Object.keys(data[c]).forEach(key => sum += data[c][key].instances);
    return sum;
  }

  getResults(action: string, data, keys: string[]): number[] {
    let results = [];
    keys.forEach(key => results.push(data[key][action].wonPerInstance));
    return results
  }

  getInstances(action: string, data, keys: string[]): number {
    let sum = 0;
    keys.forEach(key => sum += data[key][action].instances);
    return sum
  }

  createChart(chartId: string, chartData): Chart {
    const ctx = document.getElementById(chartId);
    const sortedFilteredCountKeys: string[] = this.sortFilterCountKeys(Object.keys(chartData));
    const labels = this.makeLabels(sortedFilteredCountKeys, chartData);

    return new Chart(ctx as ChartItem , {
      data: {
        labels: labels, //sortedFilteredCountKeys,
        datasets: [
          {
            type: 'bar',
            label: `Hit`,// ${this.getInstances('hit', chartData, sortedFilteredCountKeys)} `,
            data: this.getResults('hit', chartData, sortedFilteredCountKeys),
            backgroundColor: '#C4FCEF',
          },
          {
            type: 'bar',
            label: `Double`,// ${this.getInstances('double', chartData, sortedFilteredCountKeys)} `,
            data: this.getResults('double', chartData, sortedFilteredCountKeys),
            backgroundColor: '#B39CD0',
          },
          {
            type: 'bar',
            label: `Stay`, // ${this.getInstances('stay', chartData, sortedFilteredCountKeys)} `,
            data: this.getResults('stay', chartData, sortedFilteredCountKeys),
            backgroundColor: '#00C9A7',
          },
          {
            type: 'bar',
            label: `Surrender`, // ${this.getInstances('surrender', chartData, sortedFilteredCountKeys)} `,
            data: this.getResults('surrender', chartData, sortedFilteredCountKeys),
            backgroundColor: '#845EC2',
          },
        ],
      }, 
    })
  }
}