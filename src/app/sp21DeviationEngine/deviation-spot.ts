import { TableSpot, SpotStatus } from '../models';
import { Hand } from './deviation-hand';
import { Card } from './deviation-card';
import { DeviationPlayer } from './deviation-player';

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
      seedSplitHand: (x) => this.seedSplitHand(x),
      resetHand: () => this.resetHands(),
    };
  }

  addHand(isFromSplit: boolean = false, originalBetSize: number = null) {
    const player: DeviationPlayer = this.shared.getPlayerBySpotId(this.id);
    let betSize = originalBetSize || player.betSize;
    if(isFromSplit && ((betSize * 2) > player.bankroll)) {
      betSize = player.bankroll - betSize;
    }
    this.hands.push(new Hand(this.id, this.shared, betSize, this.hands.length, isFromSplit, this.controlledBy));
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
  }
}