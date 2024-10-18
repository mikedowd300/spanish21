import { Injectable } from '@angular/core';
import { Card } from './card';

export class DealerHand {

  cards: Card[] = [];

  constructor(public shared) {}

  clearCards() {
    this.shared.discard(this.cards);
    this.cards = [];
  }

  showsAce() {
    return this.cards[0].cardValue === 1;
  }

  hasBlackjack(): boolean {
    return this.cards.length === 2 && this.getValue() === 21;
  }

  hasAce() {
    return this.cards.filter(card => card.cardValue === 1).length > 0;
  }

  getSoftValue() {
    let value = 0;
    this.cards.forEach(card => value += card.cardValue);
    return value;
  }

  getValue(): number {
    let value = 0;
    this.cards.forEach(card => value += card.cardValue);
    if(this.hasAce()) {
      value = (value + 10) > 21 ? value : (value + 10);
    }
    return value;
  }

  is21() {
    return this.getValue() === 21;
  }
  
  isBust() {
    return this.getValue() > 21;
  }

  private getKeepHittingCondition(S17: boolean) {
    return (S17 && this.hasAce() && this.getValue() < 17 && this.getValue() !== this.getSoftValue()) 
    || (!S17 && this.hasAce() && this.getValue() <= 17 && this.getValue() !== this.getSoftValue()) 
    || this.getValue() < 17;
  }

  playHand(): void {
    const S17 = this.shared.getConditions().SI7;
    // let cond = (S17 && this.hasAce() && this.getValue() < 17 && this.getValue() !== this.getSoftValue()) 
    // || (!S17 && this.hasAce() && this.getValue() <= 17 && this.getValue() !== this.getSoftValue()) 
    // || this.getValue() < 17;
    while(this.getKeepHittingCondition(S17)) {
      this.cards.push(this.shared.deal());
      // cond = (S17 && this.hasAce() && this.getValue() < 17 && this.getValue() !== this.getSoftValue()) 
      //   || (!S17 && this.hasAce() && this.getValue() <= 17 && this.getValue() !== this.getSoftValue()) 
      //   || this.getValue() < 17;
    }

    // console.log('DEALERS HAND:', this.cards.map(c => c.name));
    
    // TODO - check for correct play on s17 and h17
  }

  finalize() {
    this.shared.getDealerRound({
      cards: this.cards.map(c => ({ image: c.image, name: c.name})),
      hasBlackjack: this.hasBlackjack(),
      didBust: this.isBust(),
      value: this.getValue(),
    })
    // if(this.shared.isFreshShoe()) {
      // console.log('DEALERS CARDS:', this.cards.map(c => c.cardValue).join(','), 'VALUE:', this.getValue());
    // }
  }
}