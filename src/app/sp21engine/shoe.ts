import { LocalStorageService } from "../services/local-storage.service";
import { LocalStorageItemsEnum, RoundingMethod, TrueCountType } from '../models';
import { ShoeConditions } from "../models";
import { Card } from "./card";

export class Shoe {
  // THERE ARE NO 10s IN A SPANISH 21 DECK

  private suites: string[] = ['S', 'H', 'C', 'D'];
  cards: Card[] = [];
  private hiLoRunningCount: number = 0;
  private discardTray: Card[] = [];
  private shoeCount: number = 0;
  private isFreshShoe: boolean = true; // IS THIS USED?
  private handsCount: number = 1;
  decksPerShoe: number;
  private cardsBurned: number;
  private shufflePoint: number;
  private countBurnCard: boolean;
  private cardsPerDeck: number = 48;
  private suitsPerDeck: number = 4;
  private cardsPerSuit: number = 12;
  private trueCountTypeMethodMap
  
  constructor(
    private conditions: ShoeConditions,
    private localStorage: LocalStorageService,
  ) {
    this.initializeShoe(); 
    this.trueCountTypeMethodMap = {
      [TrueCountType.FULL_FLOOR]: this.getHiLoTrueCountFloor,
      [TrueCountType.FULL_ROUNDED]: this.getHiLoTrueCountRound,
      [TrueCountType.HALF_FLOOR]: this.getHiLoTrueCountHalfFloor,
      [TrueCountType.HALF_ROUNDED]: this.getHiLoTrueCountHalfRound,
    }
  }

  initializeShoe(): void {
    this.decksPerShoe = this.conditions.decksPerShoe;
    this.cardsBurned = this.conditions.cardsBurned;
    this.shufflePoint = this.conditions.shufflePoint / 100;
    this.countBurnCard = this.conditions.countBurnCard;
    this.createShoe();
  }

  initializeRound() {
    console.log('------ INITIALIZING SHOE FOR ', this.getHandId(),' --------')
    console.log('Running Count:', this.getHiLoRunningCount());
    console.log('--------------------------------------------');
  }

  createShoe(): void {
    // FIRST CHECK LOCAL STORAGE FOR A SHOE THERE
    if(this.localStorage.getItem(LocalStorageItemsEnum.SHOES) 
      && this.localStorage.getItem(LocalStorageItemsEnum.SHOES)[`${this.decksPerShoe}-deck`]) {
      let shoe = [];
      let cards: string[] = this.localStorage.getItem(LocalStorageItemsEnum.SHOES)[`${this.decksPerShoe}-deck`].split(',');
      cards.forEach(card => shoe.push(new Card(card[1], this.getCardNumber(card[0]))));
      this.discardTray = [...shoe];
    } else {
    // CREATE SHOE IF NOT IN LOCAL STORAGE
      let shoe = [...this.createDeck()];
      for (let d = 0; d < this.decksPerShoe - 1; d++) {
        shoe = [...shoe, ...this.createDeck(false)];
      }
      this.discardTray = [...shoe];
    }
    this.shuffleCheck();
  }

  createDeck(incShoeCount: boolean = true): Card[] {
    const deck: Card[] = [];
    for(let s = 0; s < this.suitsPerDeck; s++) {
      for(let c = 0; c < this.cardsPerSuit; c++) {
        deck.push(new Card(this.suites[s], c));
      }
    }
    return this.shuffle(deck, this.cardsPerDeck, incShoeCount);
  }

  getCardNumber(val: string): number {
    switch(val) { 
      case 'A': { 
        return 0; 
      } 
      case 'J': { 
        return 9; 
      } 
      case 'Q': { 
        return 10; 
      }
      case 'K': { 
        return 11; 
      }
      default: { 
        return parseInt(val) - 1; 
      }
    }
  }

  shuffleCheck(): void {
    const fullShoeLength: number = this.cardsPerDeck * this.decksPerShoe;
    const isShuffleTime: boolean = (this.discardTray.length / fullShoeLength) >= this.shufflePoint;
    if(isShuffleTime) {
      this.cards = this.shuffle([...this.cards, ...this.discardTray]);
      this.updateLocalStorageShoe();
      this.discardTray = [];
      this.isFreshShoe = true;
      this.handsCount = 1;
      this.burn();
    } else {
      this.isFreshShoe = false;
    }
  }

  // This shuffle algorithm is purely random and not likely an ordering that would be created from a natural shuffle, but that won't change the game or win rate at all
  // Since the same deck is reused from session to session via local storage, the shuffle is even less important
  shuffle(shoe: Card[], limit: number = this.cardsPerDeck * this.decksPerShoe, incShoeCount: boolean = true): Card[] {
    const newShoe= [];
    let oldShoe = [ ...shoe ];
    const mikeRandom = (new Date().getMilliseconds()); // The random number generator will not depend solely on the built in seed
    for (let i = limit - 1; i >= 0; i--) {
      const index = Math.ceil(Math.random() * mikeRandom) % (oldShoe.length);
      newShoe.push(oldShoe[index]);
      oldShoe = [...oldShoe.slice(0, index), ...oldShoe.slice(index + 1)];
    }
    this.hiLoRunningCount = 0;
    if(incShoeCount) {
      this.shoeCount += 1;
    }
    return newShoe;
  }

  updateLocalStorageShoe = (): void => {
    // TODO - verify that all expected card values exist in the shoe and log error if they do not
    const minifiedShoe: string = this.cards.map(({ name }) => name).join(',');
    let shoes: any = this.localStorage.getItem(LocalStorageItemsEnum.SHOES)
      ? JSON.stringify(this.localStorage.getItem(LocalStorageItemsEnum.SHOES))
      : JSON.stringify({ });
    shoes = JSON.parse(shoes);
    shoes[`${this.decksPerShoe}-deck`] = minifiedShoe;
    this.localStorage.setItem(LocalStorageItemsEnum.SHOES, shoes);
  };

  burn(): void {
    let burnCards: Card[] = [];
    for(let i = 0; i < this.cardsBurned; i++) {
      burnCards.push(this.cards.pop());
      if(this.countBurnCard) {
        this.setHiLoRunningCount(burnCards[i]?.hiLoCountValue);
      }
    }
    this.discard(burnCards);
  }

  discard(discards: Card[]): void {
    this.discardTray = [ ...this.discardTray, ...discards];
  }

  isShuffleTime(): boolean {
    const fullShoeLength: number = this.cardsPerDeck * this.decksPerShoe;
    return (this.discardTray.length / fullShoeLength) >= this.shufflePoint;
  }

  deal(): Card {
    const card: Card = this.cards.pop();
    this.setHiLoRunningCount(card?.hiLoCountValue);
    return card;
  };

  dealHoleCard(): Card {
    // This card does not update the running count
    const card = this.cards.pop();
    card.isHoleCard = true;
    return card;
  }

  flipHoleCard(card: Card): void {
    card.isHoleCard = false;
    this.setHiLoRunningCount(card.hiLoCountValue);
  }

  setHiLoRunningCount = (count: number): void => {
    this.hiLoRunningCount += count;
  }

  // This is the uncounted decks remaining
  getDecksRemaining = (): number => {
    // TODO - IT looks like this formula WAS wrong which would have thrown off the TC 
    // in stat-jack (which wasn't happening) - TESTING NEEDED
    return  (this.cards.length + this.cardsBurned - (this.conditions.countBurnCard ? 1 : 0)) / this.cardsPerDeck;
  }

  getHiLoRunningCount = (): number => this.hiLoRunningCount;

  getHiLoTrueCountFloor = (): number => (Math.round(this.getHiLoRunningCount() * 10) / (10 * this.getDecksRemaining())) < 0
    ? Math.ceil((Math.round(this.getHiLoRunningCount() * 10) / (10 * this.getDecksRemaining())))
    : Math.floor((Math.round(this.getHiLoRunningCount() * 10) / (10 * this.getDecksRemaining())));
    

  getHiLoTrueCountRound = (): number => 
    Math.round((this.getHiLoRunningCount() * 10) / (10 * this.getDecksRemaining()));

  getHiLoTrueCountHalfFloor = (): number => {
    let whole = Math.round((this.getHiLoRunningCount() * 100) / this.getDecksRemaining()) / 100;
    const isNegative = whole < 0;
    if(isNegative) {
      whole = whole * -1;
    }
    const decimalPart = whole % 1;
    const intPart = whole - decimalPart;
    const roundedDecimal = decimalPart >= .5
      ? .5
      : 0
    return isNegative ? (-1) * (intPart + roundedDecimal) : intPart + roundedDecimal
  } 

  getHiLoTrueCountHalfRound = (): number => {
    let whole = Math.round((this.getHiLoRunningCount() * 100) / this.getDecksRemaining()) / 100;
    const isNegative = whole < 0;
    if(isNegative) {
      whole = whole * -1;
    }
    const decimalPart = whole % 1;
    const intPart = whole - decimalPart;
    const roundedDecimal = decimalPart >= .75 
      ? 1 
      : decimalPart >= .25 ? .5 : 0
    return isNegative ? (-1) * (intPart + roundedDecimal) : intPart + roundedDecimal
  }

  getTrueCount = (trueCountType: TrueCountType): number => this.getDecksRemaining() === 0
    ? 0
    : this.trueCountTypeMethodMap[trueCountType]();

  getShoeCount = (): number => this.shoeCount;

  getIsFreshShoe = (): boolean => this.isFreshShoe;

  getHandsCount = (): number => this.handsCount;

  incHandCount = (): void => {
    // Used in table.ts when a new hand is dealt
    this.handsCount += 1;
  }

  getHandId = (): string => `${this.shoeCount}-${this.handsCount}`;

  getCardsDealt() {
    return this.discardTray.length;
  }
}

