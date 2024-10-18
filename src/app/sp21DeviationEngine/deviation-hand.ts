import { Card } from './deviation-card';
import { DoubleType, HandAction, HandOptionEnums, PayRatioEnum, TrueCountType } from '../models';
import { playerFirst2  } from '../utilities/chart-cards';
import { PlayActionsEnum } from '../deviation-results/deviation-models';

export class Hand {

  cards: Card[] = [];
  hasBeenPaid: boolean = false;
  hasDoubled: boolean = false;
  hadDoubledXtimes: number = 0;
  payRatioMap = {
    [PayRatioEnum.THREE_to_ONE]: 3,
    [PayRatioEnum.THREE_to_TWO]: 1.5,
    [PayRatioEnum.SIX_to_FIVE]: 1.2,
    [PayRatioEnum.TWO_to_ONE]: 2,
    [PayRatioEnum.ONE_to_ONE]: 1,
  };
  options: string[] = [];
  decisionMap;
  actionMap = {
    'ST': 'stay',
    'SP': 'split',
    'SR': 'surrender',
    'H': 'hit',
    'RC': 'rescue',
    'D': 'double',
  };
  cardMap = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: 'T' };
  dealerCardMap = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10' };
  playingStrategy
  conditions

  constructor(
    private spotId: number,
    private shared, 
    public betAmount: number,
    private handId: number,
    private isFromSplit: boolean = false,
    private playedBy: string,
  ) {
    this.conditions = this.shared.getConditions();
    this.playingStrategy = this.shared.getPlayerBySpotId(this.spotId).playingStrategy.combos;
    this.decisionMap = {
      'stay': () => this.stand(),
      'split': () => this.split(),
      'surrender': () => this.surrender(),
      'hit': () => this.hit(),
      'double': () => this.double(),
      'redouble': () => this.reDouble(),
      'reredouble': () => this.reReDouble(),
      'rescue': () => this.rescue(),
    };
  }

  playHand() {
    if(this.isFromSplit && this.cards.length === 1) {
      this.cards.push(this.shared.deal());
    }
    if(!this.isBust()) { 
      this.getOptions();
      this.makeDecision();
    }
  }

  makeDecision() {
    const chartKey = this.createChartKey();
    let options: string[] = this.playingStrategy[chartKey].options
      .split(' ')
      .map(op => this.actionMap[op.trim()]);

    let conditions: string[] = this.playingStrategy[chartKey].conditions
      .split(' ')
      .filter(c => c != '')
      .map(c => c.trim());

    while(conditions.length < options.length) {
      conditions.push('?')
    }

    options.forEach((c, i) => {
      if(c === 'double') {
        if(this.hadDoubledXtimes === 1 && this.conditions.RD) {
          options[i] = 'redouble';
        } else if(this.hadDoubledXtimes === 2 && this.conditions.RRD) {
          options[i] = 'reredouble';
        } else if(this.hadDoubledXtimes > 0) {
          options[i] = '';
        }
      }
    })

    let actionConditions: any[] = options
      .map((op, i) => ({ [op]: (conditions[i] ? this.evaluateCondition(conditions[i]) : true) }))
      .filter((x, i) => this.options.includes(options[i]));
    let i = 0;
    let action: string = Object.keys(actionConditions[0])[0];
    while(!actionConditions[i][Object.keys(actionConditions[i])[0]]) {
      i++;
      action = Object.keys(actionConditions[i])[0];
    }

  
    if(this.shared.isDeviationChartKey(chartKey)) {
      const deviationKey: string = this.shared.getTrueCount(TrueCountType.FULL_ROUNDED).toString();
      this.shared.setTrueCountDeviationKey(deviationKey, this.playedBy.toLowerCase());
      if(!this.shared.hasDeviationKey(deviationKey, action as PlayActionsEnum)) {
        this.shared.addNewResultKey(deviationKey, action as PlayActionsEnum, this.betAmount)
      } else {
        this.shared.incResultsInstances(deviationKey, action as PlayActionsEnum);
        this.shared.incResultsAmountBet(this.betAmount, deviationKey, action as PlayActionsEnum);
      }
    }
    this.decisionMap[action]();
  }

  evaluateCondition(condition: string): boolean {
    const valCard1 = this.cards[0].cardValue;
    const suiteCard1 = this.cards[0].name.split('')[1];
    const valCard2 = this.cards[1].cardValue;
    const suiteCard2 = this.cards[1].name.split('')[1];

    if(condition === 'AD' && this.hadDoubledXtimes > 0 ) {
      return (this.hadDoubledXtimes === 1 && this.conditions.RD) 
        || (this.hadDoubledXtimes === 2 && this.conditions.RRD)
    } else if(condition === 'AD') {
      return false;
    }
    if(condition === 'g3') {
      return this.cards.length >= parseInt(condition.split('')[1])
    }
    if(condition === 'g4') {
      return this.cards.length >= parseInt(condition.split('')[1])
    }
    if(condition === 'g5') {
      return this.cards.length >= parseInt(condition.split('')[1])
    }
    if(condition === 'g6') {
      return this.cards.length >= parseInt(condition.split('')[1])
    }
    if(condition === '$B') {
      let val = false
      if(this.cards.length === 2 
        && suiteCard1 === suiteCard2 
        && this.shared.getDealerUpCard().cardValue === 7) {
          val = true
      }
      return val;
    }
    if(condition === 'SB') {
      let val = false
      if(this.cards.length === 2 && suiteCard1 === 's' && suiteCard2 === 's') {
        if(valCard1 === 6 && [7,8].includes(valCard2) 
          || valCard1 === 7 && [6,8].includes(valCard2) 
          || valCard1 === 8 && [6,7].includes(valCard2)) {
          val = true;
        }
      }
      return val
    }
    if(condition === 'UB') {
      let val = false
      if(this.cards.length === 2 && suiteCard1 === suiteCard2) {
        if(valCard1 === 6 && [7,8].includes(valCard2) 
          || valCard1 === 7 && [6,8].includes(valCard2) 
          || valCard1 === 8 && [6,7].includes(valCard2)) {
          val = true;
        }
      }
      return val
    }
    if(condition === 'B') {
      let val = false
      if(this.cards.length === 2) {
        if(valCard1 === 6 && [7,8].includes(valCard2) 
          || valCard1 === 7 && [6,8].includes(valCard2) 
          ||valCard1 === 8 && [6,7].includes(valCard2)) {
          val = true;
        }
      }
      return val
    }
    if(parseInt(condition)) {
      const countThreshold = parseInt(condition);
      const trueCountType = this.shared.getPlayerBySpotId(this.spotId).trueCountType;
      const trueCount = this.shared.getTrueCount(trueCountType)
      return(trueCount >= countThreshold)
    }
    return true;
  }

  createChartKey(): string {
    if(this.cards.length === 2) {
      let first: number;
      let second: number;
      if(this.cards[0].cardValue === 1) {
        first = this.cards[0].cardValue;
        second = this.cards[1].cardValue
      } else if(this.cards[1].cardValue === 1) {
        first = this.cards[1].cardValue;
        second = this.cards[0].cardValue
      } else {
        first = this.cards[0].cardValue > this.cards[1].cardValue ? this.cards[0].cardValue : this.cards[1].cardValue;
        second = this.cards[0].cardValue < this.cards[1].cardValue ? this.cards[0].cardValue : this.cards[1].cardValue
      }
      const first2Cards = `${ this.cardMap[first] }${ this.cardMap[second] }`;
      return playerFirst2.includes(first2Cards)
        ? `${ this.dealerCardMap[this.shared.getDealerUpCard()] }-${ first2Cards }`
        : `${ this.dealerCardMap[this.shared.getDealerUpCard()] }-${ this.cards[0].cardValue + this.cards[1].cardValue }`;
    } 
    return this.getValue() === this.getSoftValue()
      ? `${ this.dealerCardMap[this.shared.getDealerUpCard()] }-${ this.getValue() }`
      : `${ this.dealerCardMap[this.shared.getDealerUpCard()] }-A${ this.getSoftValue() - 1 }`;
  }

  stand() {
    if(this.is21() && !this.hasBeenPaid) {
      this.shared.payPlayerInSpot(this.spotId, this.betAmount);
      this.hasBeenPaid = true;
    }
  }

  hit() {
    this.cards.push(this.shared.deal());
    if(this.isBust() || this.is21()) {
      this.payAfterHittingCase();
      this.stand();
    } else {
      this.playHand();
    } 
  }

  payAfterHittingCase() {
    let payCoefficient: number;
    if(this.getValue() === 21) {
      payCoefficient = 1;
      if(this.cards.length === 5 || this.isSixSevenEight() || this.isTripleSevens()) {
        payCoefficient = 1.5;
      }
      if(this.cards.length === 6 || this.isSuitedSixSevenEight() || this.isSuitedTripleSevens()) {
        payCoefficient = 2;
      }
      if(this.cards.length > 6 || this.isSpadedSixSevenEight() || this.isSpadedSixSevenEight()) {
        payCoefficient = 3;
      }
      if(this.isSuperBonus() && this.betAmount < 25) {
        this.shared.payPlayerInSpot(this.spotId, 1000);
        this.hasBeenPaid = true;
      }
      if(this.isSuperBonus() && this.betAmount >= 25) {
        this.shared.payPlayerInSpot(this.spotId, 5000);
        this.hasBeenPaid = true;
      }
    } else if(this.isBust()) {
      payCoefficient = (-1);
    }
    if(!!payCoefficient && !this.isSuperBonus()) {
      this.shared.payPlayerInSpot(this.spotId, (this.betAmount * payCoefficient));
      this.hasBeenPaid = true;
    }
  }

  double(doubleType: DoubleType = DoubleType.DOUBLE) {
    this.hasDoubled = true;
    const trueCountDeviationKey = this.shared.getTrueCountDeviationKey(this.playedBy.toLowerCase());
    this.shared.incResultsAmountBet(this.betAmount, trueCountDeviationKey, this.playedBy.toLowerCase() as PlayActionsEnum);
    this.betAmount += this.betAmount;
    this.cards.push(this.shared.deal());
    this.hadDoubledXtimes += 1;
    if((this.hadDoubledXtimes === 1 && !this.conditions.RD) || this.isBust() || this.is21()) {
      if(this.is21()) {
        this.shared.payPlayerInSpot(this.spotId, this.betAmount);
        this.hasBeenPaid = true;
      } else if(this.isBust()) {
        this.shared.payPlayerInSpot(this.spotId, (-1) * this.betAmount);
        this.hasBeenPaid = true;
      }
      this.stand();
    } else {
      this.playHand();
    }
  }

  reDouble() {
    this.double(DoubleType.REDOUBLE);
  }

  reReDouble() {
    this.double(DoubleType.REREDOUBLE);
  }

  rescue() {
    this.surrender(HandAction.RESCUE);
  }

  split() {
    const trueCountDeviationKey = this.shared.getTrueCountDeviationKey(this.playedBy.toLowerCase());
    this.shared.incResultsAmountBet(this.betAmount, trueCountDeviationKey, this.playedBy.toLowerCase() as PlayActionsEnum);
    this.shared.addHand(true, this.betAmount);
    this.shared.seedSplitHand(this.cards.pop());
    this.cards.push(this.shared.deal());
    this.playHand();
  }

  surrender(actionType: HandAction = HandAction.SURRENDER): void {
    this.paySurrender();
    this.stand();
  }

  clearCards(): void {
    this.shared.discard(this.cards);
  }

  isSixSevenEight(): boolean {
    return this.cards.length === 3 
      && this.getValue() === 21 
      && [6,7,8].includes(this.cards[0].cardValue)
      && [6,7,8].includes(this.cards[1].cardValue)
      && [6,7,8].includes(this.cards[2].cardValue)
      && this.cards[0].cardValue !== this.cards[1].cardValue
      && !this.isSpadedSixSevenEight()
      && !this.isSuitedSixSevenEight();
  }

  isSuitedSixSevenEight(): boolean {
    if(this.cards.length < 3) {
      return false
    }
    const suited: boolean = this.cards[0].name.split('')[1] === this.cards[1].name.split('')[1] 
      && this.cards[0].name.split('')[1] === this.cards[2].name.split('')[1]
    return this.getValue() === 21 
      && [6,7,8].includes(this.cards[0].cardValue)
      && [6,7,8].includes(this.cards[1].cardValue)
      && [6,7,8].includes(this.cards[2].cardValue)
      && this.cards[0].cardValue !== this.cards[1].cardValue
      && suited
      && !this.isSpadedSixSevenEight();
  }

  isSpadedSixSevenEight(): boolean {
    if(this.cards.length < 3) {
      return false
    }
    const spaded: boolean = this.cards[0].name.split('')[1] === this.cards[1].name.split('')[1] 
      && this.cards[0].name.split('')[1] === this.cards[2].name.split('')[1]
      && this.cards[0].name.split('')[1] === 's'
    return this.getValue() === 21 
      && [6,7,8].includes(this.cards[0].cardValue)
      && [6,7,8].includes(this.cards[1].cardValue)
      && [6,7,8].includes(this.cards[2].cardValue)
      && this.cards[0].cardValue !== this.cards[1].cardValue
      && spaded
  }

  isTripleSevens(): boolean {
    return this.cards.length === 3 
      && this.getValue() === 21 
      && this.cards[0].cardValue === 7
      && this.cards[1].cardValue === 7
      && !this.isSpadedTripleSevens()
      && !this.isSuitedTripleSevens()
      && !this.isSuperBonus();
  }

  isSuitedTripleSevens(): boolean {
    if(this.cards.length < 3) {
      return false
    }
    const suited: boolean = this.cards[0].name.split('')[1] === this.cards[1].name.split('')[1] 
      && this.cards[0].name.split('')[1] === this.cards[2].name.split('')[1]
    return this.getValue() === 21 
      && this.cards[0].cardValue === 7
      && this.cards[1].cardValue === 7
      && suited
      && !this.isSpadedTripleSevens()
      && !this.isSuperBonus();
  }

  isSpadedTripleSevens(): boolean {
    if(this.cards.length < 3) {
      return false
    }
    const spaded: boolean = this.cards[0].name.split('')[1] === this.cards[1].name.split('')[1] 
      && this.cards[0].name.split('')[1] === this.cards[2].name.split('')[1]
      && this.cards[0].name.split('')[1] === 's'
    return this.getValue() === 21 
      && this.cards[0].cardValue === 7
      && this.cards[1].cardValue === 7
      && spaded
      && !this.isSuperBonus();
  }

  isSuperBonus(): boolean {
    if(this.cards.length < 3) {
      return false
    }
    const suited: boolean = this.cards[0].name.split('')[1] === this.cards[1].name.split('')[1] 
      && this.cards[0].name.split('')[1] === this.cards[2].name.split('')[1]
    return this.getValue() === 21 
      && this.cards[0].cardValue === 7
      && this.cards[1].cardValue === 7
      && suited
      && this.shared.getDealerUpCard() === 7
  }

  hasAce(): boolean {
    return this.cards.filter(card => card.cardValue === 1).length > 0;
  }

  getValue(): number {
    let value = 0;
    this.cards.forEach(card => value += card.cardValue);
    if(this.hasAce()) {
      value = (value + 10) > 21 ? value : (value + 10);
    }
    return value;
  }

  getSoftValue(): number {
    let value = 0;
    this.cards.forEach(card => value += card.cardValue);
    return value;
  }

  isValidDeviationHand(exceptions: string[], targetValue: string): boolean {
    // This should evolve as hands beyond the first 2 cards are evaluated
    // This should evolve as soft hands are evaluated
    const firstCard = this.cards[0].name.split('')[0]; 
    const secondCard = this.cards[1].name.split('')[0];
    let value: string = this.getValue() === this.getSoftValue() && !this.isSplittable() 
      ? this.getValue().toString() 
      : this.cards.map(c => c.name.split('')[0]).join('').replace('J', 'T').replace('Q', 'T').replace('K', 'T');
    if(targetValue.includes('A') || this.isSplittable() ) {
      value = this.cards.map(c => c.name.split('')[0]).join('').replace('J', 'T').replace('Q', 'T').replace('K', 'T')
      if(value[1] === 'A') {
        value = value.split('').reverse().join('');
      }
    }
    // Early returns are to reduce computation
    if(value !== targetValue) {
      this.shared.resetHand();
      return false
    }
    if(exceptions.length === 0) {
      return true
    }
    if(exceptions.find(e => this[e](firstCard, secondCard))) {
      this.shared.resetHand();
      return false
    }
    return true
  }

  is21(): boolean {
    return this.getValue() === 21;
  }
  
  isBust(): boolean {
    return this.getValue() > 21;
  }
  
  isBlackJack(): boolean {
    return this.cards.length === 2 && this.is21() && !this.isFromSplit;
  }

  paySurrender(): void {
    this.shared.payPlayerInSpot(this.spotId, (this.betAmount / (-2)));
    this.hasBeenPaid = true;
  }

  getOptions(): void {
    this.options = [HandOptionEnums.STAY];
    if(this.isSurrenderable()) {
      this.options.push(HandOptionEnums.SURRENDER);
    }
    if(this.isHittable()) {
      this.options.push(HandOptionEnums.HIT);
    }
    if(this.isDoubleable()) {
      this.options.push(HandOptionEnums.DOUBLE);
    }
    if(this.isSplittable()) {
      this.options.push(HandOptionEnums.SPLIT);
    }
    if(this.isReDoubleable()) {
      this.options.push(HandOptionEnums.REDOUBLE);
    }
    if(this.isReReDoubleable()) {
      this.options.push(HandOptionEnums.REREDOUBLE);
    }
    if(this.isRescueable()) {
      this.options.push(HandOptionEnums.RESCUE);
    }
  }

  isHittable(): boolean {
    if(!this.isBust() && this.hadDoubledXtimes === 0 && !this.hasDoubled) {
      return this.getValue() < 21;
    } 
    return false
  }

  isSurrenderable(): boolean {
    if(!this.conditions.canSurrenderAfterSplit && this.isFromSplit) {
      return false
    }
    return !this.isBust() && !this.isBlackJack() && this.hadDoubledXtimes === 0;
  }

  isRescueable(): boolean {
    return this.hadDoubledXtimes > 0 && this.getValue() !== 21;
  }

  isDoubleable(): boolean {
    const bankroll = this.shared.getPlayerBySpotId(this.spotId).bankroll;
    if( bankroll === 0 
      || this.isBlackJack()
      || (!this.conditions.DAS && this.isFromSplit)
      || this.hadDoubledXtimes > 0
      || (this.getValue() === 21 && this.getSoftValue() === 21)
      || this.isBust()
      || bankroll < this.betAmount && !this.conditions.DFL) {
      return false;
    }
    if((this.getValue() === 21 && this.getSoftValue() === 11)) {
      return this.conditions.DS21;
    }
    return true;
  }

  isReDoubleable() {
    const bankroll = this.shared.getPlayerBySpotId(this.spotId).bankroll;
    if( bankroll === 0 
      || this.hadDoubledXtimes !== 1
      || (this.getValue() === 21 && this.getSoftValue() === 21)
      || this.isBust()
      || !this.conditions.RD
      || bankroll < this.betAmount && !this.conditions.DFL) {
      return false;
    }
    if((this.getValue() === 21 && this.getSoftValue() === 11)) {
      return this.conditions.DS21;
    }
    return true;
  }

  isReReDoubleable() {
    const bankroll = this.shared.getPlayerBySpotId(this.spotId).bankroll;
    if( bankroll === 0 
      || this.hadDoubledXtimes !== 2
      || (this.getValue() === 21 && this.getSoftValue() === 21)
      || this.isBust()
      || !this.conditions.RRD
      || bankroll < this.betAmount && !this.conditions.DFL) {
      return false;
    }
    if((this.getValue() === 21 && this.getSoftValue() === 11)) {
      return this.conditions.DS21;
    }
    return true;
  }

  isSplittable() {
    const bankroll = this.shared.getPlayerBySpotId(this.spotId).bankroll;
    if(this.handId < this.conditions.MHFS && bankroll >= this.betAmount) {
      return this.cards.length === 2 && this.cards[0].cardValue === this.cards[1].cardValue;
    }
    return false;
  }

  payHand() {
    if(!this.hasBeenPaid) {
      const player = this.shared.getPlayerBySpotId(this.spotId)
      const dealerHandValue = this.shared.getDealerHandValue();
      const dealerBusted = this.shared.getDidDealerBust();
      let winnings: number = this.betAmount;
      if(!dealerBusted && this.getValue() < dealerHandValue) {
        winnings = (-1) * this.betAmount;
      } else if(this.getValue() === dealerHandValue) {
        winnings = 0;
      } 
      // if(this.hasDoubled) {
      //   console.log(winnings);
      // }
      player.payBankroll(winnings);
      this.hasBeenPaid = true;
    }
  }

  finalizeHandRound() {}

  isSuited(): boolean {
    // This doesn't account for when the dealer has a seven
    return this.cards[0].name.split('')[1] === this.cards[1].name.split('')[1]
    && this.cards[0].name.split('')[1] !== 'S';
  }

  isSpaded(): boolean {
    return this.cards[0].name.split('')[1] === 'S' && this.cards[1].name.split('')[1] === 'S';
  }


  X67(first, second): boolean {
    return ['6', '7'].includes(first) 
      && ['6', '7'].includes(second) 
      && !this.isSuited() 
      && !this.isSpaded();
  }

  X77(first, second): boolean {
    return !this.isSuited() && !this.isSpaded();
  }

  X68(first, second): boolean {
    return ['6', '8'].includes(first) 
      && ['6', '8'].includes(second) 
      && !this.isSuited() 
      && !this.isSpaded();
  }

  X78(first, second): boolean {
    return ['7', '8'].includes(first) 
      && ['7', '8'].includes(second) 
      && !this.isSuited() 
      && !this.isSpaded();
  }

  X67U(first, second): boolean {
    return ['6', '7'].includes(first) 
      && ['6', '7'].includes(second) 
      && this.isSuited() 
      && !this.isSpaded();
  }

  X77U(first, second): boolean {
    return this.isSuited() && !this.isSpaded();
  }

  X68U(first, second): boolean {
    return ['6', '8'].includes(first) 
      && ['6', '8'].includes(second) 
      && this.isSuited() 
      && !this.isSpaded();
  }

  X78U(first, second): boolean {
    return ['7', '8'].includes(first) 
      && ['7', '8'].includes(second) 
      && this.isSuited() 
      && !this.isSpaded();
  }

  X67S(first, second): boolean {
    return ['6', '7'].includes(first) 
      && ['6', '7'].includes(second) 
      && !this.isSuited() 
      && this.isSpaded();
  }

  X77S(first, second): boolean {
    return !this.isSuited() && this.isSpaded();
  }

  X68S(first, second): boolean {
    return ['6', '8'].includes(first) 
      && ['6', '8'].includes(second) 
      && !this.isSuited() 
      && this.isSpaded();
  }

  X78S(first, second): boolean {
    return ['7', '8'].includes(first) 
      && ['7', '8'].includes(second) 
      && !this.isSuited() 
      && this.isSpaded();
  }

  X13(first, second): boolean {
    return !['6', '7'].includes(first);
  }

  X14(first, second): boolean {
    return !['6', '8'].includes(first);
  }

  X15(first, second): boolean {
    return !['7', '8'].includes(first);
  }
}