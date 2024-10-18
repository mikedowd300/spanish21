import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderService } from '../../services/header.service';
import { RouterLink , RouterLinkActive} from '@angular/router';
import { dealerUpCards, playerFirst2 } from './../../utilities/chart-cards';
import { LoaderComponent } from '../../shared-components/loader/loader.component';
import { DeviationEngineService } from '../../sp21DeviationEngine/deviationEngine.service';
import { DeviationInfo, DoubleDownOnEnum } from '../../models';
import { 
  BonusException,
  BonusExceptions,
  CondensedDeviationTableCondition, 
  DeviationTableConditions, 
  HandStageEnum, 
  InitialDeviationTableConditions, 
  LegalActionsMap,
} from './deviation-models';

@Component({
  selector: 'deviation-finder',
  standalone: true,
  imports: [ CommonModule, FormsModule, LoaderComponent, RouterLink, RouterLinkActive ],
  templateUrl: './deviation-finder.component.html',
  styleUrl: './deviation-finder.component.scss'
})

export class DeviationFinderComponent implements OnInit {
  playerFirst2Combo: string[] = playerFirst2;
  dealersUpCards: string[] = dealerUpCards;
  selectedUpCards: string;
  selectedCombo: string;
  instances: number = 10000;
  actionsToTest: string[] = [];
  chartKey: string = "3-13"; // This is intentionally hardcoded
  doubleDownOnVals: string[] = ['DA2', 'DT11', 'D911', 'D811'];
  handStage: HandStageEnum = HandStageEnum.FIRST_2_CARDS;
  handStageEnumKeys: string[] = Object.keys(HandStageEnum);
  handStages: HandStageEnum[] = this.handStageEnumKeys.map(key => HandStageEnum[key]);
  deviationTableConditionKeys: ['RSA', 'DAS', 'DoubleOn'];
  deviationTableConditions: DeviationTableConditions = InitialDeviationTableConditions;
  bonusExceptions: BonusException[] = [];
  playersCards: string = "13";
  dealersCard: string = "3";

  constructor( 
    private headerService: HeaderService, 
    public engine: DeviationEngineService, 
  ) {}

  ngOnInit(): void {
    this.headerService.showHeader$.next(true);
    this.actionsToTest = LegalActionsMap[this.handStage].filter(a => a !== 'Split');
    this.updateBonusExceptionsByPlayersTotal();
  }

  updateBonusExceptionsByPlayersTotal() {
    const playersTotal:string = this.chartKey.split('-')[1];
    this.bonusExceptions = BonusExceptions.filter(
      e => e.displayWhenComboIs === playersTotal && this.handStage === HandStageEnum.FIRST_2_CARDS
    );
  }

  findIndexPlays() {
    this.engine.showDeviationResultsSpinner$.next(true);
    const deviationInfo: DeviationInfo = { 
      variableConditions: this.condenseConditions(),
      exceptions: this.condenseExceptions(),
      chartKey: this.chartKey,
      actions: this.actionsToTest,
      instances: this.instances,
      handStage: this.handStage,
    };
    setTimeout(() => this.engine.createTable(deviationInfo), 200);
  }

  updateChartKey({ target }, cardsType: string) {
    const isSplittable = target.value.split('')[0] === target.value.split('')[1] && target.value !== '11';
    this.playersCards = cardsType === 'players-cards' ? target.value : this.chartKey.split('-')[1];
    this.dealersCard = cardsType === 'dealers-up-cards' ? target.value : this.chartKey.split('-')[0];
    this.chartKey = `${this.dealersCard}-${this.playersCards}`;
    console.log(isSplittable, this.actionsToTest);
    if(cardsType === 'players-cards' && isSplittable && !this.actionsToTest.includes('Split')) {
      this.actionsToTest.push('Split');
    }
    if(cardsType === 'players-cards' && !isSplittable && this.actionsToTest.includes('Split')) {
      this.actionsToTest = this.actionsToTest.filter(a => a !== 'Split')
    }
    this.updateBonusExceptionsByPlayersTotal();
    console.log(cardsType, this.chartKey, this.actionsToTest, isSplittable, target.value);
  }

  condenseExceptions() {
    return this.bonusExceptions.filter(e => e.value).map(e => e.name)
  }

  condenseConditions(): CondensedDeviationTableCondition {
    return {
      RSA: this.deviationTableConditions.RSA.value,
      DAS: this.deviationTableConditions.DAS.value,
      DD: this.deviationTableConditions.DoubleOn.value,
      RD: this.deviationTableConditions.RD.value,
      RRD: this.deviationTableConditions.RRD.value,
    } as CondensedDeviationTableCondition
  }

  updateBonusExceptions(exception) {
    let activeException = this.bonusExceptions.find(e => e.name === exception.name)
    const exceptionIndex = this.bonusExceptions.indexOf(activeException);
    this.bonusExceptions[exceptionIndex].value = !this.bonusExceptions[exceptionIndex].value;
  }

  setDeviationTableCondition({ target }, key: string) {
    this.deviationTableConditions[key].value = key === 'DoubleOn' 
      ? DoubleDownOnEnum[target.value] 
      : !this.deviationTableConditions[key].value;
  }

  updateHandStage({ target }) {
    this.handStage = target.value;
  }

  goToPage() {
    console.log('Redirect to Page');
  }
}