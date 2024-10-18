import { Component, OnInit, OnDestroy, Input} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LoaderComponent } from '../../shared-components/loader/loader.component';
import { Spanish21EngineService } from '../../sp21engine/spanish21engine.service';
import { UItoLogicService } from '../../services/uiToLogic.service';
import { HeaderService } from '../../services/header.service';
import { 
  BehaviorSubject, 
  combineLatest, 
  filter, 
  map, 
  Observable, 
  Subject, 
  takeUntil 
} from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { ReplayComponent } from '../replay-component/replay.component';
import { TableRound } from '../../history/history-models';
import { BankrollChartComponent } from '../bankroll-chart-component/bankroll-chart.component';
import { RoiChartComponent } from '../roi-chart-component/roi-chart.component';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [ 
    AsyncPipe, 
    BankrollChartComponent,
    CommonModule, 
    LoaderComponent, 
    RoiChartComponent,
    RouterOutlet,
    ReplayComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnDestroy, OnInit {
  @Input() players: string[]

  public rounds$: Observable<TableRound[]>;
  public showLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public showReplay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showBankrollChart$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showRoiChart$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showStreakInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public bankrollData$: Observable<any>;
  public roiData$: Observable<any>;
  public players$: Observable<any>;
  public replayHandAtIndex$: Subject<number> = new Subject<number>();
  public activeRoundIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(0); 
  private destroy$ = new Subject();

  constructor(
    private headerService: HeaderService,
    private engine: Spanish21EngineService,
    public uiToLogicService: UItoLogicService,
  ) {}

  ngOnInit(): void {
    console.log(this.uiToLogicService.playerHandles);
    this.headerService.showHeader$.next(true);
    this.uiToLogicService.setAllowNavigationToDashboard(false);
    this.showLoader$.next(true);
    this.rounds$ = this.uiToLogicService.simData$.pipe(filter(x => !!x))
    // The dashboard component starts the entire sim

    // TODO - IT SEEMS THERE SHOULD BE A MUCH EASIER / LESS EXPENSIVE WAY TO GET THIS
    // TODO - refactor with this.uiToLogicService.playerHandles
    this.players$ = this.rounds$.pipe(map(x => x[0].players.map(p => p.handle)));

    // TODO - MAKE THE ORIGINAL SIMDATA OBJ CLOSER TO THE DESIRED SHAPE
    this.bankrollData$ = combineLatest([this.players$, this.rounds$ ])
      .pipe(map(([players, rounds]) => {
        let obj = {};
        players.forEach(p => obj[p] = { bankroll: [], moneyBet: 0})
        rounds.forEach(r => {
          r.players .forEach(p => obj[p.handle].bankroll.push(p.beginningBankroll));
          r.spots.forEach(s => s.hands.forEach(h => obj[s.playerHandle].moneyBet += h.betSize))
        }); 
        return obj;
      }));

    setTimeout(() => this.engine.createTable(this.uiToLogicService.getSimInfo()), 200);

    this.rounds$.pipe(takeUntil(this.destroy$)).subscribe(() => this.showLoader$.next(false));
    this.replayHandAtIndex$.pipe(takeUntil(this.destroy$)).subscribe((index) => {
      this.activeRoundIndex$.next(index);
      this.showBankrollChart$.next(false);
      this.showReplay$.next(true);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.showLoader$.next(true);
    this.uiToLogicService.simData$.next(null);
  }
}