import { TableSpot, SpotStatus } from '../models';
import { Hand } from './hand';
import { Card } from './card';

export class Spot {
  status: SpotStatus = SpotStatus.AVAILABLE;
  controlledBy: string = null;
  hasInsurance: boolean = false;
  insuranceBetAmount: number = 0;
  hands: Hand[] = [];
  id: number;

  constructor(spotInfo: TableSpot, public shared) {
    this.initializeSpot(spotInfo);
    this.shared = { 
      ...this.shared,
      getHandCount: () => this.getHandCount(),
      addHand: (x, y) => this.addHand(x, y), 
      seedSplitHand: (x) => this.seedSplitHand(x)
    };
  }

  removePlayer() {
    this.status = SpotStatus.AVAILABLE;
    this.controlledBy = null;
    this.hasInsurance = false;
    this.insuranceBetAmount = 0;
    this.hands = [];
  }

  addHand(isFromSplit: boolean = false, originalBetSize: number = null) {
    const player = this.shared.getPlayerBySpotId(this.id);
    let betSize = originalBetSize || player.betSize;
    if(isFromSplit && ((betSize * 2) > player.bankroll)) {
      // This allows splitting for less when the player is out of money
      betSize = player.bankroll - betSize;
    }
    this.hands.push(new Hand(this.id, this.shared, betSize, this.hands.length, isFromSplit));
  }

  seedSplitHand(card: Card) {
    const index = this.hands.length - 1;
    this.hands[index].cards.push(card);
  }

  getHandCount(): number {
    return this.hands.length;
  }

  initializeSpot({ status, controlledBy, id }: TableSpot): void {
    this.status = status;
    this.controlledBy = controlledBy;
    if(!this.id) {
      this.id = id + 1;
    }
  }

  hasUnpaidHands(): boolean {
    return this.hands.filter(h => !h.hasBeenPaid).length > 0;
  }

  getUnpaidHands(): Hand[] {
    return this.hands.filter(h => !h.hasBeenPaid)
  }

  resetHands(): void {
    this.hands.forEach(hand => hand.clearCards());
    this.hands = [];
    // Any stat initialization will happen here
  }

  // finalizeHand(): void {
  //   this.hands.forEach(h => h.finalizeHand());
  // }

  unassignSpot(): void {
    this.status = SpotStatus.AVAILABLE;
    this.controlledBy = null;
  }

  assignSpot(controlledBy: string): void {
    this.status = SpotStatus.TAKEN;
    this.controlledBy = controlledBy;
  }

  considerInsurance(): void {
    // In Spanish 21, it is always a bad idea to take insurance and basic strategy agrees, so it will not be implemented for now.
    // However, in the practice implementation, it will exist
  }

  payInsurance() {
    // const amount: number = this.shared.dealerHasBlackjack()
    //   ? this.insuranceBetAmount * 2
    //   : this.insuranceBetAmount * (-1);
    // this.shared.payPlayerInSpot(this.id, amount);
    // this.hands[0].setHandResult('Insurance', amount);
    // this.insuranceBetAmount = 0;
    // this.hasInsurance = false;
  }

  payDealersBlackjack() {
    this.hands[0].payDealersBlackjack(this.id);
  }

  payBlackjack() {
    this.hands[0].payBlackjack(this.id);
  }
}