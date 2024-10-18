import { 
  Conditions, 
  DeviationInfo, 
  LocalStorageItemsEnum, 
  PlayerTableInfo, 
  PlayStrategyCombo, 
  ShoeConditions, 
  SpotStatus, 
  TableSpotsInformation,
  TrueCountType,
} from '../models';
import { DeviationPlayer } from './deviation-player';
import { LocalStorageService } from '../services/local-storage.service';
import { Shoe } from './deviation-shoe';
import { SpotManager } from './deviation-spot-manager';
import { DealerHand } from './deviation-dealer-hand';
import { PlayActionsEnum } from '../deviation-results/deviation-models';

export class Table {
  conditions: Conditions;
  spotCount: number;
  shoe: Shoe;
  players: DeviationPlayer[] = [];
  instances: number;
  playedRounds: number = 0;
  spotManager: SpotManager;
  totalRoundsDealt: number = 0;
  dealerHand: DealerHand;
  validDeals: number = 0;
  playerTCMap = {
    [PlayActionsEnum.STAY]: '',
    [PlayActionsEnum.SPLIT]:  '',
    [PlayActionsEnum.HIT]:  '',
    [PlayActionsEnum.DOUBLE]:  '',
    [PlayActionsEnum.REDOUBLE]:  '',
    [PlayActionsEnum.REREDOUBLE]:  '',
  }

  constructor(
    private deviationInfo: DeviationInfo,
    private localStorageService: LocalStorageService,
    public shared
  ) {
    this.conditions = this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.CONDITIONS, 
      "Deviation Conditions" 
    );
    this.conditions = { ...this.conditions, ...this.deviationInfo.variableConditions };
    this.initializeShoe();
    this.shared = {
      ...shared,
      payPlayerInSpot: (p, a) => this.payPlayerInSpot(p, a),
      getPlayerBySpotId: (x) => this.getPlayerBySpotId(x),
      discard: (x) => this.shoe.discard(x),
      deal: () => this.shoe.deal(),
      getDecksRemaining: () => this.shoe.getDecksRemaining(),
      getTrueCount: (x: TrueCountType) => this.shoe.getTrueCount(x),
      getConditions: null,
      getDealerUpCard: () => this.getDealerUpCard(),
      getDidDealerBust: () => this.getDidDealerBust(),
      getDealerHandValue: () => this.getDealerHandValue(),
      getSpotById: (x) => this.spotManager.getSpotById(x),
      isFreshShoe: () => this.shoe.getIsFreshShoe(),
      getDeviationChartKey: () => this.getDeviationChartKey(),
      isDeviationChartKey: (x: string) => this.isDeviationChartKey(x),
      setTrueCountDeviationKey: (x: string, y: PlayActionsEnum) => this.setTrueCountDeviationKey(x, y),
      getTrueCountDeviationKey: (x: PlayActionsEnum) => this.getTrueCountDeviationKey(x),
      dealerHasBlackjack: () => this.dealerHasBlackjack(),
    };
    this.initializeTable();
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

  initializeTable() {
    this.spotCount = this.conditions.spotsPerTable;
    this.instances = this.deviationInfo.instances;
    this.initializePlayers();
    const spotMapPlayers: PlayerTableInfo[] = this.players.map(p => ({
      seatNumber: p.spotId,
      playerConfigTitle: p.handle,
    }))
    const spotInfo: TableSpotsInformation = { 
      spotsPertable: this.conditions.spotsPerTable,
      playerSpotMap: this.getPlayerSpotMap(spotMapPlayers),
    };
    this.shared.getConditions = () => this.conditions;
    this.spotManager = new SpotManager(spotInfo, this.shared);
    this.dealerHand = new DealerHand(this.shared);

    console.log(this);
  }

  getPlayerSpotMap(players: PlayerTableInfo[]): {[k: string]: number} {
    let playerSpotMap: {[k: string]: number} = {};
    players.forEach(p => playerSpotMap[p.playerConfigTitle] = p.seatNumber);
    return playerSpotMap;
  }

  initializePlayers() {
    this.players = this.deviationInfo.actions
      .filter(a => a !== 'Surrender' && a !== 'Rescue')
      .map((action, i) => (new DeviationPlayer({ 
        seatNumber: i + 1, 
        playerConfigTitle: action
      }, this.localStorageService, this.getPlayStrategyCombo(action), this.shared)));

    console.log(this.players);
  }

  getPlayStrategyCombo(action: string): PlayStrategyCombo {
    const actionMap = {
      "Hit": "H",
      "Stay": "ST",
      "Double": "D",
      "Split": "SP"
    };
    return {
      [this.deviationInfo.chartKey]: {
        conditions: "",
        options: actionMap[action]
      }
    }
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

  finalizeRound() {
    this.spotManager.getTakenSpots().forEach(spot => spot.resetHands());
    this.dealerHand.clearCards();
    this.shoe.shuffleCheck();
    this.playedRounds += 1;
  }

  play() {
    let hasSpots: boolean = this.spotManager.spots.filter(s => s.status === SpotStatus.TAKEN).length > 0;
    while(this.playedRounds < this.instances && hasSpots) {
      this.deal();
      if(this.isValidDeal()) {
        this.validDeals += 1;
        this.playHands();
        this.playDealersHand();
        this.payHands();
      }
      this.finalizeRound();
    }
    this.shared.hideDeviationResultsSpinner();
    this.shared.showDeviationResults();

    console.log(this.validDeals);
  }

  isValidDeal(): boolean {
    if(this.shared.dealerHasBlackjack()) {
      return false;
    }
    const deviationDealsUpCard = this.deviationInfo.chartKey.split('-')[0];
    const deviationPlayersCards = this.deviationInfo.chartKey.split('-')[1];
    const dealersUpCard = this.dealerHand.cards
      .map(c => c.name)[0].split('')[0].replace('J', '10').replace('Q', '10').replace('K', '10');
    const hasSpotWithValidHand: boolean = this.spotManager.getTakenSpots()
      .map(s => s.hands[0].isValidDeviationHand(this.deviationInfo.exceptions, deviationPlayersCards))
      .includes(true);
    return hasSpotWithValidHand && deviationDealsUpCard === dealersUpCard
  }

  getPlayerBySpotId(targetSpotId: number): DeviationPlayer {
    return this.players.find(({ spotId }) => targetSpotId === spotId);
  }

  playHands() {
    this.spotManager.playHands();
  }

  payHands() {
    if(this.spotManager.getTakenUnpaidSpots().length > 0) {
      this.spotManager.payHands();
    }
  }

  playDealersHand() {
    this.shoe.flipHoleCard(this.dealerHand.cards[1]);
    if(this.spotManager.getTakenUnpaidSpots().length > 0) {
      this.dealerHand.playHand();
    }
  }

  payPlayerInSpot(spotId: number, amount: number) {
    this.getPlayerBySpotId(spotId).payBankroll(amount);
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

  getDeviationChartKey(): string {
    return this.deviationInfo.chartKey;
  }

  isDeviationChartKey(key: string): boolean {
    return key === this.deviationInfo.chartKey;
  }

  setTrueCountDeviationKey(trueCountDeviationKey: string, actionKey: PlayActionsEnum) {
    this.playerTCMap[actionKey] = trueCountDeviationKey;
  }

  getTrueCountDeviationKey(playerName: PlayActionsEnum): string {
    return this.playerTCMap[playerName];
  }

  dealerHasBlackjack(): boolean {
    return this.dealerHand.hasBlackjack();
  }
}