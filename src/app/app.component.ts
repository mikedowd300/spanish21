import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Current Setup is for testing of shoe and conditions
import { LocalStorageService } from './services/local-storage.service';
import { ConditionsComponent } from './page-components/conditions/conditions.component';
import { TippingStrategyComponent } from './page-components/tipping-strategy/tipping-strategy.component';
import { BetSpreadComponent } from './page-components/bet-spreads/bet-spread.component';
import { WongStrategyComponent } from './page-components/wong-strategy/wong-strategy.component';
import { UnitResizeStrategyComponent } from './page-components/unit-resize-strategy/unit-resize-strategy.component';
import { PlayStrategyComponent } from './page-components/play-strategy/play-strategy.component';
import { PlayerConfigComponent } from './page-components/player-config/player-config.component';
import { TableConfigComponent } from './page-components/table-config/table-config.component';
import { HeaderNavComponent } from './shared-components/header-nav/header-nav.component';
import { PracticeComponent } from './page-components/practice/practice.component';
import { SimulationComponent } from './page-components/simuation/simulation.component';
import { DeviationFinderComponent } from './page-components/deviation-finder/deviation-finder.component';
import { DeviationChartsComponent } from './page-components/deviation-charts/deviation-charts.component';
import { CountStrategyComponent } from './page-components/count-strategy/count-strategy.component';
import { LoaderComponent } from './shared-components/loader/loader.component';
// import { DashboardComponent } from './dashboard-components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    BetSpreadComponent, 
    ConditionsComponent,
    CountStrategyComponent,
    DeviationChartsComponent,
    DeviationFinderComponent, 
    HeaderNavComponent,
    PlayerConfigComponent,
    PlayStrategyComponent,
    PracticeComponent,
    SimulationComponent,
    TableConfigComponent,
    TippingStrategyComponent, 
    UnitResizeStrategyComponent,
    WongStrategyComponent,
    LoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private localStorage: LocalStorageService) {
    console.log('The Game will start from a service')
  }
}
