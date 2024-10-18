import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../services/header.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'configurations',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.scss'
})

export class ConfigurationsComponent implements OnInit {

  configs = [{
    title: 'Conditions',
    tagLine: 'Customize any table conditions',
    link: '/conditions'
  },{
    title: 'Player Configs',
    tagLine: 'Set strategies, bankroll and betsize',
    link: '/player-config'
  },{
    title: 'Table Configs',
    tagLine: 'Customize tables with rules and players',
    link: '/table-config'
  },{
    title: 'Bet Spreads',
    tagLine: 'Determine when and how much to spread bets',
    link: '/bet-spreads'
  },{
    title: 'Play Charts',
    tagLine: 'Find a strategy right for your conditions',
    link: '/play-strategy'
  },{
    title: 'Unit Resizing',
    tagLine: 'Determine when and how much to resize bets',
    link: '/unit-resizing'
  },{
    title: 'Wonging',
    tagLine: 'Choose if and when to add more hands',
    link: '/wonging'
  },{
    title: 'Tipping',
    tagLine: 'Decide if, when and how much to tip',
    link: '/tipping'
  },{
    title: 'Count',
    tagLine: 'Create a new counting system',
    link: '/count'
  },]

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.showHeader$.next(true);
  }
}