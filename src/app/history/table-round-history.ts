import { DealerRound, HandRound, PlayerRound, ShoeRound, SpotRound, TableRound } from "./history-models";

export class History {
  rounds: TableRound[] = [];
  activeRound: TableRound;
  roundId: number = 0;
  activePlayers: PlayerRound[];

  constructor(){}

  startRound() {
    this.activePlayers = [];
    this.activeRound = {
      roundId: this.roundId,
      shoe: null,
      spots: [],
      players: [],
      dealer: null,
    }
    this.roundId += 1;
  }

  getShoeRound(round: ShoeRound) {
    this.activeRound.shoe = { ...round };
  }

  getDealerRound(round: DealerRound) {
    this.activeRound.dealer = { ...round };
  }

  addSpotsRoundWithEmptyHands(spot: SpotRound) {
    this.activeRound.spots.push(spot);
  }

  addHandRoundToSpotRoundById(id: number, hand: HandRound) {
    let activeSpot = this.activeRound.spots.find(s => s.spotId === id);
    activeSpot.hands.push(hand);
  }

  addPlayersRound(player: PlayerRound) {
    this.activeRound.players.push(player);
  }

  finalizeRound() {
    this.rounds.push(this.activeRound);
  }
}