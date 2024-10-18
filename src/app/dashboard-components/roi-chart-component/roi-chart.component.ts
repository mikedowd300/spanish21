import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { Chart, ChartItem, registerables } from 'chart.js';
import { TableRound } from '../../history/history-models';

@Component({
  selector: 'roi-chart',
  standalone: true,
  imports: [ AsyncPipe, CommonModule ],
  templateUrl: './roi-chart.component.html',
  styleUrl: './roi-chart.component.scss'
})

export class RoiChartComponent implements OnDestroy, OnInit {
  @Input() showRoiChart$: BehaviorSubject<boolean>;
  @Input() handles: string[];
  @Input() rounds$: Observable<TableRound[]>;

  totalWinningsByCountChart: Chart;
  averageWinningsByCountChart: Chart;
  roiByCountChart: Chart;
  
  roiData$: Observable<any>;
  countRoundingMethods: string[] = [
    'hiLoTrueCountFloor',
    'hiLoTrueCountRound',
    'hiLoTrueCountHalfFloor',
    'hiLoTrueCountHalfRound',
  ];
  selectedRoundingMethod$:  BehaviorSubject<string> = new BehaviorSubject<string>('hiLoTrueCountFloor');
  activeTarget$: BehaviorSubject<string> = new BehaviorSubject<string>('Table');
  undateChartRange$: BehaviorSubject<number> = new BehaviorSubject<number>(25);
  selectableChartTargets: string[];
  private destroy$ = new Subject();

  constructor() {}

  ngOnInit(): void {
    this.selectableChartTargets = [ ...this.handles ];
    this.selectableChartTargets.push('Table');
    Chart.register(...registerables);

    this.roiData$ = combineLatest([this.selectedRoundingMethod$, this.rounds$]).pipe(map(([method, rounds]) => {
      let obj: any = {};
      rounds.forEach(r => {
        if(obj[r.shoe[method]]) {
          obj[r.shoe[method]].instances += 1;
        } else {
          obj[r.shoe[method]] = this.initializeNewRoundObject();
        }
        r.spots.filter(s => s.status === 'taken').forEach(s => s.hands.forEach(h => {
          obj[r.shoe[method]]['Table'].totalWon += h.winnings;
          obj[r.shoe[method]]['Table'].totalBet += h.betSize;
          obj[r.shoe[method]][s.playerHandle].totalWon += h.winnings;
          obj[r.shoe[method]][s.playerHandle].totalBet += h.betSize;
        }))
      })
      return obj;
    }))

    combineLatest([this.undateChartRange$, this.activeTarget$,this.roiData$]).pipe(takeUntil(this.destroy$))
      .subscribe(([range, activeTarget, roiData]) => {
        console.log(activeTarget, roiData);
        const totalWonData: number[] = [];
        const labels: string[] = this.getLabels(roiData, range);
        const totalWinningData = this.getTotalWinningData(roiData, labels, activeTarget);
        const averageWinningData = this.getAverageWinningData(roiData, labels, activeTarget);
        const roiWinningData = this.getRoiWinningData(roiData, labels, activeTarget);
        console.log(labels);
        this.totalWinningsByCountChart = 
          this.createTotalWinningsByCountChart(totalWinningData, labels, activeTarget);
        this.averageWinningsByCountChart = 
          this.createAverageWinningsByCountChart(averageWinningData, labels, activeTarget);
        this.roiByCountChart = 
          this.createRoiByCountChart(roiWinningData, labels, activeTarget);
      });
  }

  getLabels(data, range): string[] {
    return Object.keys(data)
      .map(l => parseInt(l))
      .sort((a, b) => a - b)
      .filter(x => (x >= (-1) * range) && (x <= range))
      .map(l => `${l.toString()} : ${ data[l.toString()].instances }`);
  }

  getTotalWinningData(data, labels, target: string): number[] {
    return labels.map(l => data[l.split(' : ')[0]][target].totalWon)
  }

  getAverageWinningData(data, labels, target: string): number[] {
    return labels.map(l => data[l.split(' : ')[0]][target].totalWon / data[l.split(' : ')[0]].instances)
  }
  getRoiWinningData(data, labels, target: string): number[] {
    return labels.map(l => Math.round((data[l.split(' : ')[0]][target].totalWon * 1000 / data[l.split(' : ')[0]][target].totalBet)) / 10)
  }

  initializeNewRoundObject() {
    let obj = { 
      instances: 1,
      Table: {
        totalBet: 0, 
        totalWon: 0,
      } ,
    };
    this.handles.forEach(h => obj[h] = { 
      totalBet: 0, 
      totalWon: 0 
    },)
    return obj;
  }

  handleSelectRoundingMethod({ target }) {
    this.selectedRoundingMethod$.next(target.value);
  }

  createTotalWinningsByCountChart(data, labels: string[], target: string): Chart {
    if(this.totalWinningsByCountChart) {
      this.totalWinningsByCountChart.destroy();
    }
    const ctx = document.getElementById('total-winnings-chart');

    return new Chart(ctx as ChartItem , {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${target}'s Total Winning Chart`,
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

  createAverageWinningsByCountChart(data, labels: string[], target: string): Chart {
    if(this.averageWinningsByCountChart) {
      this.averageWinningsByCountChart.destroy();
    }
    const ctx = document.getElementById('average-winnings-chart');

    return new Chart(ctx as ChartItem , {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${target}'s Average Winning Chart`,
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

  createRoiByCountChart(data, labels: string[], target: string): Chart {
    if(this.roiByCountChart) {
      this.roiByCountChart.destroy();
    }
    const ctx = document.getElementById('roi-chart');

    return new Chart(ctx as ChartItem , {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${target}'s Roi Chart`,
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
    this.activeTarget$.next(target.value);
  }

  updateChartRange({ target }) {
    this.undateChartRange$.next(target.value);
  }
  
  ngOnDestroy() {
    this.destroy$.next(true);
  }
}