import { Component, Input, OnInit} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TableRound } from '../../history/history-models';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'replay',
  standalone: true,
  imports: [ AsyncPipe, CommonModule ],
  templateUrl: './replay.component.html',
  styleUrl: './replay.component.scss'
})

export class ReplayComponent implements OnInit {
  @Input() rounds: TableRound[];
  @Input() showReplay$: BehaviorSubject<boolean>;
  @Input() activeRoundIndex: number = 0;

  public maxRound: number;
  public activeRound: TableRound;
  public bankrolls: { [k: string]: number } = {};
  public trueCounts: { [k: string]: number } = {};

  constructor() {}

  ngOnInit(): void {
    this.maxRound = this.rounds.length - 1;
    this.activeRound = this.rounds[this.activeRoundIndex];
    console.log(this.activeRound);
    this.updateBankrollsAndTrueCounts();
  }

  getNextRound() {
    this.activeRoundIndex += 1;
    this.activeRound = this.rounds[this.activeRoundIndex];
    this.updateBankrollsAndTrueCounts();
  }

  updateBankrollsAndTrueCounts() {
    this.activeRound.players.forEach(p => this.bankrolls[p.handle] = p.beginningBankroll)
    this.activeRound.players.forEach(p => this.trueCounts[p.handle] = p.beginningTrueCount)
  }
}