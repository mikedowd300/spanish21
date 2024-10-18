import { Component, OnInit } from '@angular/core';
import { 
  Conditions, 
  DoubleDownOnEnum, 
  InputTypeEnum, 
  LocalStorageItemsEnum, 
  PayRatioEnum, 
  RuleInput 
} from '../../models';
import { defaultConditions } from '../../default-configs/conditions';
import { RuleDescriptionMap } from '../../utilities/rule-description-map';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { StrategySelectorComponent } from '../../shared-components/strategy-selector/strategy-selector.component';

@Component({
  selector: 'conditions',
  standalone: true,
  imports: [ FormsModule, AsyncPipe, CommonModule, StrategySelectorComponent ],
  templateUrl: './conditions.component.html',
  styleUrl: './conditions.component.scss'
})

export class ConditionsComponent implements OnInit {

  activeStrategy: Conditions = { ...defaultConditions };
  activeStrategy$: BehaviorSubject<Conditions> = new BehaviorSubject<Conditions>(defaultConditions);
  localStorageItemsEnum = LocalStorageItemsEnum;
  title: string = "Select, Add, Edit or Delete a Condition Configuration";
  defaultStrategy: Conditions =  { ...defaultConditions };
  defaultStrategiesObj = { 'Default Conditions': defaultConditions };

  inputRules: RuleInput[];
  textInputRules: RuleInput[];
  numberInputRules: RuleInput[];
  radioInputRules: RuleInput[];
  checkboxInputRules: RuleInput[];
  rangeInputRules: RuleInput[];
  payRatioEnumArray = Object.keys(PayRatioEnum).map(key => PayRatioEnum[key]);
  doubleDownOnEnumArray = Object.keys(DoubleDownOnEnum).map(key => DoubleDownOnEnum[key]);
  radioMap = {
    DD: this.doubleDownOnEnumArray,
    payRatioFromAA: this.payRatioEnumArray,
    payRatio: this.payRatioEnumArray,
  }

  constructor() {}

  ngOnInit() {
    this.inputRules = Object.keys(RuleDescriptionMap)
      .map(key => RuleDescriptionMap[key]);
    this.textInputRules = this.inputRules
      .filter(rule => rule.inputType === InputTypeEnum.TEXT);
    this.numberInputRules = this.inputRules
      .filter(rule => rule.inputType === InputTypeEnum.NUMBER);
    this.radioInputRules = this.inputRules
      .filter(rule => rule.inputType === InputTypeEnum.RADIO)
      .map(rule => ({ ...rule, radioValues: this.radioMap[rule.ruleName] }));

    this.checkboxInputRules = this.inputRules
      .filter(rule => rule.inputType === InputTypeEnum.CHECKBOX);
    this.rangeInputRules = this.inputRules
      .filter(rule => rule.inputType === InputTypeEnum.RANGE);

    this.activeStrategy$.subscribe(strategy => {
      this.activeStrategy = strategy;
    });
  }

  updateCheckboxInput(e, ruleName: string) {
    this.activeStrategy[ruleName] = !this.activeStrategy[ruleName];
  }

  updateNumberInput({ target }, rule: RuleInput) {
    const val: number = parseInt(target.value);
    this.activeStrategy[rule.ruleName as string] = val;
    if(!!rule.min && rule.min > val) {
      this.activeStrategy[rule.ruleName as string] = rule.min;
    } 
    if (rule.max && rule.max < val) {
      this.activeStrategy[rule.ruleName as string] = rule.max;
    }
  }

  updateRangeInput({ target }, rule: RuleInput) {
    const val: number = parseInt(target.value);
    this.activeStrategy[rule.ruleName as string] = val;
  }

  updateRadioInput(rule: RuleInput, radioValue: any) {
    this.activeStrategy[rule.ruleName as string] = radioValue;
  }
}
