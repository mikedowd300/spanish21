import { cardValues } from '../models'

export class Card {
  name: string;
  image: string;
  cardValue: number;
  hiLoCountValue: number;

  constructor(suit: string, index: number, public isHoleCard: boolean = false) {
    this.name = `${cardValues[index]}${suit}`;
    this.image = `https://deckofcardsapi.com/static/img/${this.name}.png`;
    this.cardValue = Math.min(index + 1, 10);
    this.hiLoCountValue = this.setHiLoCountValueForCard(Math.min(10, index + 1));
  }

  // Doesnt count 6s, Does Count 2s
  // setHiLoCountValueForCard(value: number): number {
  //   if(value > 1 && value < 6) {
  //     return 1
  //   }
  //   if(value === 1 || value === 10) {
  //     return -1
  //   }
  //   return 0;
  // }

  // Doesnt count 2s, Does Count 6s
  setHiLoCountValueForCard(value: number): number {
    if(value > 2 && value < 7) {
      return 1
    }
    if(value === 1 || value === 10) {
      return -1
    }
    return 0;
  }

  // Count 6s and 9s
  // setHiLoCountValueForCard(value: number): number {
  //   if(value > 1 && value <= 6) {
  //     return 1
  //   }
  //   if(value === 1 || value === 10 || value === 9) {
  //     return -1
  //   }
  //   return 0;
  // }

  // Aces Worth 2 / Count 6s
  // setHiLoCountValueForCard(value: number): number {
  //   if(value > 1 && value <= 6) {
  //     return 1
  //   }
  //   if(value === 1) {
  //     return -2
  //   }
  //   if(value === 10) {
  //     return -1
  //   }
  //   return 0;
  // }
}