import { Component, Input, OnInit} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { Chart, ChartItem, registerables } from 'chart.js';

@Component({
  selector: 'bankroll-chart',
  standalone: true,
  imports: [ AsyncPipe, CommonModule ],
  templateUrl: './bankroll-chart.component.html',
  styleUrl: './bankroll-chart.component.scss'
})

export class BankrollChartComponent implements OnInit {
  @Input() showBankrollChart$: BehaviorSubject<boolean>;
  @Input() bankrollData: any;
  @Input() replayHandAtIndex$: Subject<number>;

  handles: string[];
  activeHandle: string;
  chart: Chart;
  moneyBetByPlayer: number;
  moneyWonByPlayer: number;
  roundsPlayedByPlayer: number;
  playersWinRate: number;
  playerStartingBankroll: number;
  playerEndingBankroll: number;
  isZoomMode: boolean = false;
  zoomIndices: number[] = [];
  zoomOffset: number = 0;
  chartData: any;

  constructor() {}

  ngOnInit(): void {
    this.chartData = { ...this.bankrollData }
    this.handles = Object.keys(this.bankrollData);
    this.activeHandle = this.handles[0];
    Chart.register(...registerables);
    this.chart = this.createBankrollChart();
    this.getPlayersStats();
  }

  getPlayersStats() {
    this.roundsPlayedByPlayer = this.chartData[this.activeHandle].bankroll.length;
    this.playerStartingBankroll = this.chartData[this.activeHandle].bankroll[0];
    this.playerEndingBankroll = this.chartData[this.activeHandle].bankroll[this.roundsPlayedByPlayer - 1];
    this.moneyBetByPlayer = this.chartData[this.activeHandle].moneyBet;
    this.moneyWonByPlayer = this.playerEndingBankroll - this.playerStartingBankroll;
    this.playersWinRate = Math.round( (this.moneyWonByPlayer * 10000) / this.moneyBetByPlayer) / 100;
  }

  onCanvasClick(event) {
    const res = this.chart.getElementsAtEventForMode(
      event,
      'nearest',
      { intersect: true },
      true
    );
    if (res.length === 0) {
      return;
    }

    if(this.isZoomMode) {
      this.zoomIndices.push(res[0].index);
      if(this.zoomIndices.length === 2) {
        this.zoomIndices.sort((a, b) => a - b);
        this.zoomOffset += this.zoomIndices[0];
        this.handles.forEach(h => this.chartData[h].bankroll = 
          this.chartData[h].bankroll.slice(this.zoomIndices[0], this.zoomIndices[1] + 1));
        this.chart = this.createBankrollChart();
        this.isZoomMode = false;
        this.zoomIndices = [];
      }
    } else {
      this.replayHandAtIndex$.next(res[0].index + this.zoomOffset);
    }
  }

  setZoomMode() {
    this.isZoomMode = true;
  }

  createBankrollChart(): Chart {
    if(this.chart) {
      this.chart.destroy();
    }
    const ctx = document.getElementById('myChart');
    const data = this.chartData[this.activeHandle].bankroll;
    const labels: string[] = data.map((d, i) => i.toString());

    return new Chart(ctx as ChartItem , {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${this.activeHandle}'s Bankroll`,
          data: data,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: { 
            grid: { 
              drawOnChartArea: false 
            } 
          },
          y: {
            beginAtZero: false,
            grid: { 
              drawOnChartArea: false 
            }
          }
        }
      }
    })
  }

  handleSelectHandle({ target }) {
    this.activeHandle = target.value;
    this.chart = this.createBankrollChart();
    this.getPlayersStats();
  }
}