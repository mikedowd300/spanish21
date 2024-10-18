import { TableSpot, TableSpotsInformation, SpotStatus } from '../models';
import { Spot } from './spot';

export class SpotManager {

  spots: Spot[] = [];

  constructor(private spotsInfo: TableSpotsInformation, private shared) {
    this.initializeSpots(this.spotsInfo);
  }

  initializeSpots({ spotsPertable, playerSpotMap }: TableSpotsInformation): void {
    for(let s = 0; s < spotsPertable; s++) {
      const controlledBy = Object.keys(playerSpotMap)
        .find(player => playerSpotMap[player] === (s + 1));
      const spot: TableSpot = { 
        status:  controlledBy ? SpotStatus.TAKEN : SpotStatus.AVAILABLE,
        controlledBy: controlledBy ? controlledBy : null,
        id: s
      };
      this.spots.push(new Spot(spot, this.shared));
    }

    console.log(this.spots);
  }

  isSpotAvailable(id: number): boolean {
    return this.getSpotById(id).status === SpotStatus.AVAILABLE
  }

  getSpotById(id: number): Spot {
    return this.spots.find(s => s.id === id);
  }

  getTakenSpots(): Spot[] {
    return this.spots.filter(({ status }) => status === SpotStatus.TAKEN);
  }

  getTakenUnpaidSpots(): Spot[] {
    return this.getTakenSpots().filter(spot => spot.hasUnpaidHands());
  }

  getInsuredSpots(): Spot[] {
    return this.getTakenSpots().filter(spot => spot.hasInsurance);
  }

  offerEarlySurrender(): void {
    // this.getTakenSpots().forEach(spot => spot.considerEarlySurrender());
  }

  offerInsurance(): void {
    this.getTakenSpots().forEach(spot => spot.considerInsurance());
  }

  payInsurance(): void {
    // this.getInsuredSpots().forEach(spot => spot.payInsurance());
  }

  payDealersBlackjack(): void {
    this.getTakenSpots().forEach(spot => spot.payDealersBlackjack());
  }

  payBlackjacks(): void {
    this.getTakenUnpaidSpots().forEach(spot => spot.payBlackjack());
  }

  playHands(): void {
    this.getTakenUnpaidSpots().forEach(spot => {
      // spot.hands.forEach(h => h.playHand())
      spot.hands[0].playHand();
      spot.hands[1]?.playHand();
      spot.hands[2]?.playHand();
      spot.hands[3]?.playHand();
      spot.hands[4]?.playHand();
      spot.hands[5]?.playHand();
      spot.hands[6]?.playHand();
    })
  }

  payHands(): void {
    this.getTakenUnpaidSpots().forEach(spot => spot.getUnpaidHands().forEach(h => h.payHand()))
  }

  // finalizeHand(): void {
  //   // this.spots.forEach(s => s.finalizeHand());
  // }
}