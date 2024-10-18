import { inject } from '@angular/core';
import { CanMatchFn, RedirectCommand, Router, Routes } from '@angular/router';
import { UItoLogicService } from './services/uiToLogic.service';
import { ConditionsComponent } from './page-components/conditions/conditions.component';
import { TippingStrategyComponent } from './page-components/tipping-strategy/tipping-strategy.component';
import { BetSpreadComponent } from './page-components/bet-spreads/bet-spread.component';
import { PlayStrategyComponent } from './page-components/play-strategy/play-strategy.component';
import { PlayerConfigComponent } from './page-components/player-config/player-config.component';
import { TableConfigComponent } from './page-components/table-config/table-config.component';
import { UnitResizeStrategyComponent } from './page-components/unit-resize-strategy/unit-resize-strategy.component';
import { WongStrategyComponent } from './page-components/wong-strategy/wong-strategy.component';
import { ConfigurationsComponent } from './page-components/configurations/configurations.component';
import { PracticeComponent } from './page-components/practice/practice.component';
import { SimulationComponent } from './page-components/simuation/simulation.component';
import { DeviationFinderComponent } from './page-components/deviation-finder/deviation-finder.component';
import { DeviationChartsComponent } from './page-components/deviation-charts/deviation-charts.component';
import { CountStrategyComponent } from './page-components/count-strategy/count-strategy.component';
import { HomeComponent } from './page-components/home/home.component';
import { DashboardComponent } from './dashboard-components/dashboard-component/dashboard.component';
// import { ReplayComponent } from './dashboard-components/replay-component/replay.component';

const canMatchDashboard: CanMatchFn = () => {
  const service = inject(UItoLogicService);
  const router = inject(Router);
  return service.getAllowNavigationToDashboard()
    ? true
    : new RedirectCommand(router.parseUrl('/simulation'));
};

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'configurations',
    component: ConfigurationsComponent
  },
  {
    path: 'practice',
    component: PracticeComponent
  },
  {
    path: 'simulation',
    component: SimulationComponent
  },
  {
    path: 'deviations',
    component: DeviationFinderComponent
  },
  {
    path: 'deviation-charts',
    component: DeviationChartsComponent
  },
  {
    path: 'conditions',
    component: ConditionsComponent
  },
  {
    path: 'tipping',
    component: TippingStrategyComponent
  },
  {
    path: 'bet-spreads',
    component: BetSpreadComponent
  },
  {
    path: 'play-strategy',
    component: PlayStrategyComponent
  },
  {
    path: 'player-config',
    component: PlayerConfigComponent
  },
  {
    path: 'table-config',
    component: TableConfigComponent
  },
  {
    path: 'unit-resizing',
    component: UnitResizeStrategyComponent
  },
  {
    path: 'wonging',
    component: WongStrategyComponent
  },
  {
    path: 'count',
    component: CountStrategyComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canMatch: [canMatchDashboard],
  },
];
