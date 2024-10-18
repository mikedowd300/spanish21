import { 
  Conditions, 
  LocalStorageItemsEnum, 
  PlayerTableInfo, 
  ShoeConditions, 
  SimInfo, 
  SpotStatus, 
  TableSpotsInformation
} from '../models';
import { Player } from './player';
import { LocalStorageService } from '../services/local-storage.service';
import { Shoe } from './shoe';
import { SpotManager } from './spot-manager';
import { DealerHand } from './dealer-hand';
import { History } from '../history/table-round-history';

export class Table {
  conditions: Conditions;
  spotCount: number;
  shoe: Shoe;
  players: Player[] = [];
  iterations: number;
  playedRounds: number = 0;
  spotManager: SpotManager;
  totalRoundsDealt: number = 0;
  dealerHand: DealerHand; 
  history: History = new History();

  constructor(
    private simInfo: SimInfo,
    private localStorageService: LocalStorageService,
    public shared
  ) {
    this.conditions = this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.CONDITIONS, 
      this.simInfo?.tableSkeleton.conditionsTitle
    );
    this.initializeShoe();
    this.shared = {
      ...shared,
      payPlayerInSpot: (p, a) => this.payPlayerInSpot(p, a),
      getPlayerBySpotId: (x) => this.getPlayerBySpotId(x),
      discard: (x) => this.shoe.discard(x),
      deal: () => this.shoe.deal(),
      getDecksRemaining: () => this.shoe.getDecksRemaining(),
      getTrueCount: (x) => this.shoe.getTrueCount(x),
      getConditions: null,
      dealerHasBlackjack: () => this.dealerHasBlackjack(),
      getDealerUpCard: () => this.getDealerUpCard(),
      getDidDealerBust: () => this.getDidDealerBust(),
      getDealerHandValue: () => this.getDealerHandValue(),
      getDealerRound: (x) => this.history.getDealerRound(x),
      // getPlayingStrategyFromTitle: (x) => this.playChartMakerService.getStrategyFromTitle(x),
      // getBettingStrategyFromTitle: (x) => this.betSpreadService.getStrategyFromTitle(x),
      // getInsuranceStrategyFromTitle: (x) => this.insuranceService.getStrategyFromTitle(x),
      // getUnitResizingStrategyFromTitle: (x) => this.unitResizingService.getStrategyFromTitle(x),
      // getWongingStrategyFromTitle: (x) => this.wongingService.getStrategyFromTitle(x),
      // getTippingStrategyFromTitle: (x) => this.tippingService.getStrategyFromTitle(x),
      // getInsuranceStrategyBySpotId: (x) => this.getInsuranceStrategyBySpotId(x),
      getOccupiedActiveSpotCount: () => this.getOccupiedActiveSpotCount(),
      getSpotById: (x) => this.spotManager.getSpotById(x),
      // getPlayers: () => this.players, // THIS IS FOR TESTING
      // getSpots: () => this.spotManager.spots, // THIS IS FOR TESTING
      isFreshShoe: () => this.shoe.getIsFreshShoe(),
      isSpotAvailable: (x) => this.spotManager.isSpotAvailable(x),
      // getTable: () => this,
      // getTotalRoundsDealt: () => this.totalRoundsDealt,
      // first2Cards: this.playChartMakerService.playerFirst2
    };
    this.initializeTable(this.simInfo.tableSkeleton.players);
    this.play();
  }

  initializeShoe() {
    const shoeConditions: ShoeConditions = {
      decksPerShoe: this.conditions.decksPerShoe,
      cardsBurned: this.conditions.cardsBurned,
      shufflePoint: this.conditions.shufflePoint,
      countBurnCard: this.conditions.countBurnCard
    };
    this.shoe = new Shoe(shoeConditions, this.localStorageService);
  }

  initializeTable(players: PlayerTableInfo[]) {
    this.spotCount = this.conditions.spotsPerTable;
    this.iterations = this.simInfo.iterations;
    const spotInfo: TableSpotsInformation = { 
      spotsPertable: this.conditions.spotsPerTable,
      playerSpotMap: this.getPlayerSpotMap(players),
    };
    this.shared.getConditions = () => this.conditions;
    this.spotManager = new SpotManager(spotInfo, this.shared);
    players.forEach(p => this.players.push(new Player(p, this.localStorageService, this.shared)));
    this.dealerHand = new DealerHand(this.shared);
  }

  getPlayerSpotMap(players: PlayerTableInfo[]): {[k: string]: number} {
    let playerSpotMap: {[k: string]: number} = {};
    players.forEach(p => playerSpotMap[p.playerConfigTitle] = p.seatNumber);
    return playerSpotMap;
  }

  initializePlayers(playersInfo: PlayerTableInfo[]) {
    playersInfo.forEach(p => this.players.push(new Player(p, this.localStorageService, this.shared)));
  }

  getOccupiedActiveSpotCount(): number {
    return this.spotManager.spots.filter(s => s.status === SpotStatus.TAKEN).length;
  }

  deal() {
    this.shoe.incHandCount();
    this.spotManager.getTakenSpots().forEach(spot => spot.addHand());
    this.spotManager.getTakenSpots()
      .forEach(({ hands }) => hands
      .forEach(({ cards }) => cards.push(this.shoe.deal())));
    this.dealerHand.cards.push(this.shoe.deal());
    this.spotManager.getTakenSpots()
      .forEach(({ hands }) => hands
      .forEach(({ cards }) => cards.push(this.shoe.deal())));
    this.dealerHand.cards.push(this.shoe.dealHoleCard());
    this.totalRoundsDealt++;
  }

  initializeRound() {
    // this is where players will wong in (and out?), adjust their bet up or down, tip. If its a new shoe, this could be where players evaluate and change the size of their betting unit.
    // this is where statistcs for a round are initialized, what that means is TBD
    // Check that players betsize is as least as big as their bankroll
    // If the players betSize is less then the bankroll, the bet might be resized here by the betResize strategy, but that isn't a guarantee, if not the players betsize should be resized to the table min, it the bankroll still is not big enough, the player should leave the table - BUT THE PLAYER SHOULD LEAVE THE TABE AT THE END OF A HAND, NOT THE BEGINNING.
    //Players leave at the end of a hand because this gives other players to play that spot at the beginning of he next hand.

    // this.shoe.initializeRound();
    // ALLOW WONGED OUT PLAYERS TO WONG IN - ESPECIALLY IF ITS THE PLAYERS MAIN (1st) HAND
    // ALLOW Players wonged out of their main hand to wong in before other players wong into the spot with their additional hands
    this.players.forEach(p => p.initializeRound());

    // All spots' hadBlackJack properties need to be set to false
    this.history.startRound();
    this.history.getShoeRound({
      handId: this.shoe.getHandId(),
      hiLoRunningCount: this.shoe.getHiLoRunningCount(),
      hiLoTrueCountFloor: this.shoe.getHiLoTrueCountFloor(),
      hiLoTrueCountRound: this.shoe.getHiLoTrueCountRound(),
      hiLoTrueCountHalfFloor: this.shoe.getHiLoTrueCountHalfFloor(),
      hiLoTrueCountHalfRound: this.shoe.getHiLoTrueCountHalfRound(),
    });
    this.players.forEach(p => this.history.addPlayersRound({
      bettingUnit: p.betSize,
      handle: p.handle,
      beginningBankroll: p.bankroll,
      spotIds: p.spotIds,
      beginningTrueCount: p.beginningTrueCount,
    }));
    this.spotManager.spots.forEach(s => this.history.addSpotsRoundWithEmptyHands({
      status: s.status,
      spotId: s.id,
      playerHandle: s.controlledBy,
      hands: [],
    }));
  }

  // export interface spotRound {
    // status: SpotStatus,
    // spotId: number,
    // playerHandle: string,
    // hands: HandRound;
  // }
  // addSpotsRoundWithEmptyHands(spot: spotRound) {
  //   this.activeRound.spots.push(spot);
  // }

  finalizeRound() {
    // This is where players leave the table, either because they are out of money or they Wong out.
    // This is also when and where stat objects for a round are finalized.
    // This is where the roundCount is incremented

    // this.finalizeRoundHistory();
    this.dealerHand.finalize();
    // this.spotManager.getTakenSpots().forEach(spot => spot.finalizeHand());
    this.spotManager.spots.forEach(s => s.hands.forEach(h => {
      h.finalizeHandRound();
      this.history.addHandRoundToSpotRoundById(s.id, h.history)
    }));
    this.spotManager.getTakenSpots().forEach(spot => spot.resetHands());
    this.dealerHand.clearCards();
    this.shoe.shuffleCheck();
    this.playedRounds += 1;
    this.removeBrokePlayers();
    this.players.forEach(p => p.finalizeRound());
    this.history.finalizeRound();
  }

  play() {
    let hasSpots: boolean = this.spotManager.spots.filter(s => s.status === SpotStatus.TAKEN).length > 0;
    while(this.playedRounds < this.iterations && hasSpots) {
      // PER ROUND OUTPUT TESTING - TC CAN CHANGE BY PLAYER
      this.initializeRound();
      // this.shared.outputResults(this);
      this.deal();
      this.payPlayersBlackjacks();
      // this.offerInsurance();
      // this.payStandardInsurance();
      this.handleDealerBlackjack();
      this.playHands();
      this.playDealersHand();
      this.payHands();

      // this.spotManager.spots.forEach(s => s.hands.forEach(h => h.cards.forEach(c => console.log(c))))
      // console.log('Dealer has: ' + this.dealerHand.cards[0].name, this.dealerHand.cards[1].name);

      this.finalizeRound();
      hasSpots = this.spotManager.spots.filter(s => s.status === SpotStatus.TAKEN).length > 0;
    }
    console.log(this.players.map(p => `${p.handle}:${p.bankroll}:${p.tippedAway}   `).join(', '));
    
    console.log(this.players.map(p => {
      const ratio = Math.round(10000 * ((p.bankroll - p.originalBankroll) / (Math.max(p.totalBet, 1)))) / 100;
      return`${p.handle}: TOTAL BET:${p.totalBet} : MONEYWONtoMONEYBET RATIO: ${ratio} each of the ${this.totalRoundsDealt} \n`
    }).join(' '));
  }

  getPlayerBySpotId(spotId: number): Player {
    return this.players.find(({ spotIds }) => spotIds.includes(spotId))
  }

  getPlayerByHandle(handle: string): Player {
    return this.players.find(p => p.handle === handle)
  }

  removePlayerFromSpotsByHandle(handle) {
    const spotIds = this.getPlayerByHandle(handle).spotIds
    spotIds.forEach(id => this.spotManager.getSpotById(id).removePlayer());
  }

  removeBrokePlayers() {
    // Remove from spots and from the players list
    // TODO - TEST IMPLEMENTATION
    let brokePlayerHandles: string[] = []
    this.players
      .filter(p => p.bankroll < this.conditions.minBet)
      .forEach(p => {
        brokePlayerHandles.push(p.handle);
        this.removePlayerFromSpotsByHandle(p.handle)
      });
    this.players = this.players.filter(p => !brokePlayerHandles.includes(p.handle));
  }

  playHands() {
    if(!this.dealerHand.hasBlackjack()) {
      this.spotManager.playHands()
    }
  }

  offerInsurance() {
    if(this.dealerHand.showsAce()) {
      this.spotManager.offerInsurance();
    }
  }

  handleDealerBlackjack() {
    if(this.dealerHand.hasBlackjack()) { 
      this.spotManager.payDealersBlackjack();
    }
  }

  payHands() {
    if(!this.dealerHand.hasBlackjack() && this.spotManager.getTakenUnpaidSpots().length > 0) {
      this.spotManager.payHands();
    }
  }

  playDealersHand() {
    this.shoe.flipHoleCard(this.dealerHand.cards[1]);
    if(!this.dealerHand.hasBlackjack() && this.spotManager.getTakenUnpaidSpots().length > 0) {
      this.dealerHand.playHand();
    // } else {
    //   console.log('NO PLAYER LEFT WITH CARDS:', this.dealerHand.cards.map(c => c.name));
    }
  }

  payPlayerInSpot(spotId: number, amount: number) {
    this.getPlayerBySpotId(spotId).payBankroll(amount);
  }

  payPlayersBlackjacks(){
    this.spotManager.payBlackjacks();
  };

  dealerHasBlackjack(): boolean {
    return this.dealerHand.hasBlackjack();
  }

  getDealerUpCard(): string {
    return this.dealerHand.cards[0].cardValue.toString();
  }

  getDealerHandValue() {
    return this.dealerHand.getValue();
  }

  getDidDealerBust() {
    return this.dealerHand.isBust();
  }
}