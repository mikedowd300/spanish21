import { Card } from './card';
import { BonusTypeEnum, DoubleType, HandAction, HandOptionEnums, HandOutcomeEnum, PayRatioEnum } from '../models';
import { playerFirst2  } from '../utilities/chart-cards';
import { HandRound } from '../history/history-models';

export class Hand {

  cards: Card[] = [];
  hasBeenPaid: boolean = false;
  hasDoubled: boolean = false;
  payRatioMap = {
    [PayRatioEnum.THREE_to_ONE]: 3,
    [PayRatioEnum.THREE_to_TWO]: 1.5,
    [PayRatioEnum.SIX_to_FIVE]: 1.2,
    [PayRatioEnum.TWO_to_ONE]: 2,
    [PayRatioEnum.ONE_to_ONE]: 1,
  };
  hadDoubledXtimes: number = 0;
  options: string[] = [];
  decisionMap;
  decisionHistory: string[] = [];

  handResult: any = {
    outcome: [],
    winnings: [],
  }

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
  playStrategy
  conditions
  history: HandRound;

  constructor(
    private spotId: number,
    private shared, 
    public betAmount: number,
    private handId: number,
    private isFromSplit: boolean = false,
  ) {
    this.conditions = this.shared.getConditions();
    this.playStrategy = this.shared.getPlayerBySpotId(this.spotId).playingStrategy.combos;
    this.history = this.getHistory();
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

  private getHistory(history = null): HandRound {
    const partialHistory = {
      actions: [],
      outcome: null,
      winnings: 0,
      isFromSplit: false,
      doubleType: null,
      didSurrender: false,
      wasRescued: false,
      isFromWong: false,
      bonusFor21: null,
      tipSize: 0,
    }

    const partialComputedHistory = {
      betSize: this.betAmount,
      cards: this.cards.map(c => ({ image: c.image, name: c.name })),
      value: this.getValue(),
      bonusType: this.getBonustype(),
    };

    return !!history 
      ? { ... history, ... partialComputedHistory }
      : { ...partialHistory, ...partialComputedHistory };
  }

  private getBonustype(): BonusTypeEnum | null {
    if(!this.cards[0]) {
      return null
    }
    if(this.isSuperBonus()) {
      return BonusTypeEnum.SUPER_BONUS
    } else if (this.isSpadedTripleSevens()) {
      return BonusTypeEnum.TRIPLE_7S_SPADED
    } else if (this.isSuitedTripleSevens()) {
      return BonusTypeEnum.TRIPLE_7S_SUITED
    } else if (this.isTripleSevens()) {
      return BonusTypeEnum.TRIPLE_7S;
    } else if (this.isSpadedSixSevenEight()) {
      return BonusTypeEnum.SPADED_6_7_8
    } else if (this.isSuitedSixSevenEight) {
      return BonusTypeEnum.SUITED_6_7_8
    } else if (this.isSixSevenEight) {
      return BonusTypeEnum.SPADED_6_7_8
    }
    return null
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

  isFromWong(): boolean {
    return this.shared.getPlayerBySpotId(this.spotId).wongSpotIds.includes(this.spotId);
  }

  makeDecision() {
    // this.options tracks what actions are legal
    // options tracks which actions the player wants to do, based on conditions, regardless if its legal
    // actionOptions filters out the players illegal options as well as filters out the players options based on conditions
    // the first action on the list of actionOptions is the players action
    const chartKey = this.createChartKey();
    // if(!this.playStrategy[chartKey]) {
    //   console.log(chartKey, this.cards.map(c => c.name));
    // }
    let options: string[] = this.playStrategy[chartKey].options
      .split(' ')
      .map(op => this.actionMap[op.trim()]);

    let conditions: string[] = this.playStrategy[chartKey].conditions
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

    // actionConditions creates an array of objects with the key being the playAction as a string, and the value being a boolean to determine if the playAction is valid
    // Since the same playAction can exist with different conditions, this CANNOT be a simpler key;value pair object.
    let actionConditions: any[] = options
      .map((op, i) => ({ [op]: (conditions[i] ? this.evaluateCondition(conditions[i]) : true) }))
      .filter((x, i) => this.options.includes(options[i]));

    // actionCondition should be typed

    let i = 0;
    // if(actionConditions.length === 0 || !Object.keys(actionConditions[0])) {
    //   console.log(chartKey);
    //   console.log("this.options:", this.options);
    //   console.log(conditions);
    //   console.log(actionConditions);
    //   console.log(this.playStrategy[chartKey]);
    //   console.log(this.playStrategy[chartKey].options);
    // }
    // if(!actionConditions) {
    //   console.log('PROBLEM WITH THESE CARDS:', this.cards.map(c => c.name));
    // }
    let action: string = Object.keys(actionConditions[0])[0];
    while(!actionConditions[i][Object.keys(actionConditions[i])[0]]) {
      i++;
      // if(!actionConditions[i]) {
      //   console.log(
      //     this.shared.getPlayerBySpotId(this.spotId).handle + ':', this.cards[0].name, this.cards[1].name + ' :', chartKey + ' :', action);
      //   console.log(this.options, options, conditions, actionConditions);
      // }
      action = Object.keys(actionConditions[i])[0];
    }
    // console.log(
    //   this.shared.getPlayerBySpotId(this.spotId).handle + ':', this.cards[0].name, this.cards[1].name + ' :', chartKey + ' :', action);

    // this.decisionHistory.push(action);
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
    // if(['3', '4', '5', '6'].includes(condition)) {
    //   console.log('INSPECTING LENGTH', condition);
    //   return this.cards.length >= parseInt(condition)
    // }
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
      // Check for possible super bunus
      let val = false
      if(this.cards.length === 2 
        && suiteCard1 === suiteCard2 
        && this.shared.getDealerUpCard().cardValue === 7) {
          val = true
      }
      return val;
    }
    if(condition === 'SB') {
      // Check for possible SPADED bunus
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
      // Check for possible SUITED bunus
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
      // Check for possible 678 bunus
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
      // check for index plays
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
      this.history.winnings = this.betAmount;
      this.hasBeenPaid = true;
    }
  }

  hit() {
    this.history.actions.push(HandAction.HIT);
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
        if(this.cards.length === 5) {
          this.history.bonusFor21 = PayRatioEnum.THREE_to_TWO
        }
      }
      if(this.cards.length === 6 || this.isSuitedSixSevenEight() || this.isSuitedTripleSevens()) {
        payCoefficient = 2;
        if(this.cards.length === 6) {
          this.history.bonusFor21 = PayRatioEnum.TWO_to_ONE
        }
      }
      if(this.cards.length > 6 || this.isSpadedSixSevenEight() || this.isSpadedSixSevenEight()) {
        payCoefficient = 3;
        if(this.cards.length > 6) {
          this.history.bonusFor21 = PayRatioEnum.THREE_to_ONE
        }
      }
      if(this.isSuperBonus() && this.betAmount < 25) {
        // console.log('>>> Super Bonus for 1000 <<<');
        this.shared.payPlayerInSpot(this.spotId, 1000);
        this.history.winnings = 1000;
        this.hasBeenPaid = true;
      }
      if(this.isSuperBonus() && this.betAmount >= 25) {
        // console.log('>>> Super Bonus for 5000 <<<');
        this.shared.payPlayerInSpot(this.spotId, 5000);
        this.history.winnings = 5000;
        this.hasBeenPaid = true;
      }
    } else if(this.isBust()) {
      this.history.outcome = HandOutcomeEnum.BUSTED;
      payCoefficient = (-1)
    }
    if(!!payCoefficient && !this.isSuperBonus()) {
      // if(this.isBust()) {
      //   console.log('>>> Player busts! <<<', this.shared.getPlayerBySpotId(this.spotId).bankroll);
      // } else {
      //   console.log('>>> Player Hit to 21 with ' + payCoefficient + ' X multiplier <<<');
      // }
      this.shared.payPlayerInSpot(this.spotId, (this.betAmount * payCoefficient));
      this.history.winnings = (this.betAmount * payCoefficient);
      this.hasBeenPaid = true;
    }
  }

  double(doubleType: DoubleType = DoubleType.DOUBLE) {
    // console.log('DOUBLE WITH', this.cards.length, 'CARDS!');
    // this.hasDoubled = true;
    this.history.doubleType = doubleType;
    if(doubleType === DoubleType.DOUBLE) {
      this.history.actions.push(HandAction.DOUBLE);
    }
    const bankroll = this.shared.getPlayerBySpotId(this.spotId).bankroll;
    // const tipSize = this.shared.getPlayerBySpotId(this.spotId).tipSize;
    this.betAmount = bankroll < (2 * this.betAmount) ? bankroll : 2 * this.betAmount;
    this.shared.getPlayerBySpotId(this.spotId).incTotalBet(this.betAmount / 2);
    // if(bankroll > this.betAmount + tipSize ) {
    //   this.shared.getPlayerBySpotId(this.spotId).doubleDealersTip(this.isFromWong());
    // }
    this.cards.push(this.shared.deal());
    // console.log(this.cards.map(c => c.name));
    // if(this.isBust()) {
    //   this.decisionHistory.push('bust');
    // }

    // SHOULD THE PLAYER COME HERE FOR REDOUBLE AND REREDOUBLE? - maybe, probably
    
    this.hadDoubledXtimes += 1;
    if((this.hadDoubledXtimes === 1 && !this.conditions.RD) || (this.hadDoubledXtimes === 2 && !this.conditions.RRD)  || this.isBust() || this.is21()) {
      if(this.is21()) {
        // console.log('>>> Player doubled to 21 <<<')
        this.shared.payPlayerInSpot(this.spotId, this.betAmount);
        this.history.winnings = this.betAmount;
        this.hasBeenPaid = true;
      }
      this.stand();
    } else {
      this.playHand();
    }
  }

  reDouble() {
    // console.log('--------------   REDOUBLE !!!!!!!!!!!!!!!!!!!!!!!!!');
    this.history.actions.push(HandAction.REDOUBLE);
    this.double(DoubleType.REDOUBLE);
  }

  reReDouble() {
    // console.log('-----------------   RE-REDOUBLE !!!!!!!!!!!!!!!!!!!!');
    this.history.actions.push(HandAction.REREDOUBLE);
    this.double(DoubleType.REREDOUBLE);
  }

  rescue() {
    this.surrender(HandAction.RESCUE);
  }

  split() {
    // console.log('SPLITTING ' + this.cards[0].name.split('')[0] + 's');
    const bankroll = this.shared.getPlayerBySpotId(this.spotId).bankroll;
    // const tipSize = this.shared.getPlayerBySpotId(this.spotId).tipSize;
    const betSize = this.shared.getPlayerBySpotId(this.spotId).betSize;
    // this.shared.getPlayerBySpotId(this.spotId).incTotalBet(betSize);
    this.shared.addHand(true, this.betAmount);
    this.shared.seedSplitHand(this.cards.pop()); // Can't this be built into addHand?
    this.cards.push(this.shared.deal());
    // if(bankroll > (2 * this.betAmount) + tipSize ) {
    //   this.shared.getPlayerBySpotId(this.spotId).tipSplitHands(this.isFromWong());
    // }
    this.history.isFromSplit = true;
    this.history.actions.push(HandAction.SPLIT);
    this.playHand();
  }

  surrender(actionType: HandAction = HandAction.SURRENDER): void {
    this.history.actions.push(actionType);
    this.history.didSurrender = actionType === HandAction.SURRENDER;
    this.history.wasRescued = actionType === HandAction.RESCUE;
    this.history.outcome = actionType === HandAction.SURRENDER
      ? HandOutcomeEnum.SURRENDERED
      : HandOutcomeEnum.RESCUED
    this.paySurrender();
    // console.log('=== ' + this.shared.getPlayerBySpotId(this.spotId).handle + ' surrendered ===')
    this.stand();
  }

  clearCards(): void {
    this.shared.discard(this.cards);
  }

  hasBlackjack(): boolean {
    return this.cards.length === 2 && this.getValue() === 21 && !this.isFromSplit;
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
    this.history.winnings = (this.betAmount / (-2));
    this.hasBeenPaid = true;
  }

  payDealersBlackjack(spotId: number): void {
    if(!this.hasBeenPaid) {
      this.history.outcome = HandOutcomeEnum.LOST_TO_BLACKJACK;
      this.shared.payPlayerInSpot(spotId, -(this.betAmount));
      this.history.winnings = -(this.betAmount);
      this.hasBeenPaid = true;
      // console.log('>>>>> Dealer Has Blackjack <<<<<');
      // this.setHandResult('Dealer Blackjack', -(this.betAmount));
    } //else {
    //   this.setHandResult('Player Blackjack', winnings);
    // }
  }

  payBlackjack(spotId: number): void {
    const amount = this.betAmount * this.payRatioMap[this.conditions.payRatio];
    if(this.hasBlackjack()) {
      this.history.outcome = HandOutcomeEnum.BLACKJACK;
      this.shared.getPlayerBySpotId(this.spotId).hadBlackJackLastHand = true;
      this.shared.payPlayerInSpot(spotId, amount);
      this.hasBeenPaid = true;
      this.history.winnings = amount;
    }
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
    const player = this.shared.getPlayerBySpotId(this.spotId)
    const dealerHandValue = this.shared.getDealerHandValue();
    const dealerBusted = this.shared.getDidDealerBust();
    let winnings: number = this.betAmount;
    if(dealerBusted) {
      this.history.outcome = HandOutcomeEnum.WON_BY_DEALER_BUST;
    } else if(this.getValue() < dealerHandValue) {
      winnings = (-1) * this.betAmount;
      this.history.outcome = HandOutcomeEnum.LOST_TO_BETTER_HAND;
    } else if(this.getValue() === dealerHandValue) {
      this.history.outcome = HandOutcomeEnum.PUSHED
      winnings = 0;
    } else {
      this.history.outcome = HandOutcomeEnum.WON_WITH_BETTER_HAND;
    }
    player.payBankroll(winnings);
    this.history.winnings = winnings;
    this.hasBeenPaid = true;
  }

  finalizeHandRound() {
    this.history = this.getHistory(this.history);
  }
}