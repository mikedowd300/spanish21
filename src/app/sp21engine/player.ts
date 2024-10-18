import { 
  BetSpreadStrategy,
  ChipTypeEnum,
  CountingStrategy, 
  HandHistory, 
  LocalStorageItemsEnum, 
  PlayerConfig, 
  PlayerRoundHistory, 
  PlayerTableInfo, 
  PlayStrategy,
  RoundingMethod,
  SpotStatus, 
  TippingStrategy, 
  TrueCountType, 
  UnitResizeStrategy, 
  WongStrategy 
} from '../models';
import { LocalStorageService } from '../services/local-storage.service';

export class Player {
  handle: string;
  resizeProgression: number[] = [];
  bettingUnit: number;
  progressiveBettingUnitIndex:number = 0;
  bankroll: number;
  originalBankroll: number;
  playingStrategy: PlayStrategy;
  betSpreadingStrategy: BetSpreadStrategy;
  unitResizingStrategy: UnitResizeStrategy;
  wongingStrategy: WongStrategy;
  tippingStrategy: TippingStrategy;
  countingStrategy: CountingStrategy;
  spotIds: number[] = [];
  wongSpotIds: number[] = [];
  tipSize: number = 0;
  tippedAway: number = 0;
  totalBet: number = 0;
  spotId: number;
  amountBetPerHand: number = 0; // should this be called amountBetTHIShand?
  hadBlackJackLastHand: boolean = false;
  betSizeLastHand: number;
  betSize: number = null;
  trueCountType: TrueCountType;
  beginningTrueCount: number;
  history: PlayerRoundHistory[] = [];

  constructor(
    playerInfo: PlayerTableInfo, 
    private localStorageService: LocalStorageService,
    public shared
  ){
    this.initializePlayer(playerInfo);
  }

  initializePlayer({ seatNumber, playerConfigTitle }: PlayerTableInfo): void {
    const skeleton: PlayerConfig = this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.PLAYER_CONFIG, 
      playerConfigTitle
    );
    this.spotId = seatNumber;
    this.handle = skeleton.title;
    this.bettingUnit = skeleton.initialBettingUnit;
    this.betSizeLastHand = this.bettingUnit;
    this.bankroll = skeleton.initialBankroll;
    this.originalBankroll =skeleton.initialBankroll;
    this.playingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.PLAY,
      skeleton.playStrategyTitle
    )};
    this.playingStrategy.combos = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.PLAY,
      skeleton.playStrategyTitle
    ).combos };

    // TODO Check to make sure there are no nested values that are passed by reference or else players strategies may be reassigned to the last player with the strategy
    
    console.log(this.playingStrategy);
    this.betSpreadingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.BET_SPREAD,
      skeleton.betSpreadStrategyTitle
    )};
    this.unitResizingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.UNIT_RESIZE,
      skeleton.unitResizingStrategyTitle
    )};
    this.wongingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.WONG,
      skeleton.wongingStrategyTitle
    )};
    this.tippingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.TIPPING,
      skeleton.tippngStrategyTitle
    )};
    this.countingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.COUNT,
      skeleton.countStrategyTitle
    )};
    this.trueCountType = this.getTrueCountType();
    // console.log(this.handle, this.trueCountType);
    // this.resizeProgression = this.initializeResizeProgression();
    this.addSpot(seatNumber);
  }

  // export interface PlayerRound {
  //   bettingUnit: number;
  //   handle: string;
  //   beginningBankroll: number;
  //   spotIds: number[];
  //   beginningTrueCount: number;
  // }
  // addPlayersRound(player: PlayerRound) {
  //   this.activeRound.players.push(player);
  // }

  // resizeRound(size: number): number {
    // const roundingMethod = this.unitResizingStrategy.roundingMethod;
    // const roundToNearest = this.unitResizingStrategy.roundToNearest;
    // const ROUND_UP = RoundingMethod.UP;
    // const ROUND_DOWN = RoundingMethod.DOWN;
    // const WHITE_CHIP = ChipTypeEnum.WHITE;
    // const RED_CHIP = ChipTypeEnum.RED;
    // let betAmount = size;
    // if(roundingMethod === RoundingMethod.UP && roundToNearest === WHITE_CHIP && size % 1 === .5) {
    //   betAmount += .5;
    // }
    // if(roundingMethod === RoundingMethod.DOWN && roundToNearest === WHITE_CHIP && size % 1 === .5) {
    //   betAmount -= .5;
    // }
    // if(roundingMethod === RoundingMethod.UP && roundToNearest === RED_CHIP && size % 5 === 2.5) {
    //   betAmount += 2.5;
    // }
    // if(roundingMethod === RoundingMethod.DOWN && roundToNearest === RED_CHIP && size % 5 === 2.5) {
    //   betAmount -= 2.5;
    // }
    // if(roundingMethod === RoundingMethod.UP && roundToNearest === RED_CHIP && size % 5 === .5) {
    //   betAmount = Math.ceil(size / 5) * 5;
    // }
    // if(roundingMethod === RoundingMethod.DOWN && roundToNearest === RED_CHIP && size % 5 === .5) {
    //   betAmount = Math.floor(size / 5) * 5;
    // }
    // return betAmount;
  // }

  // initializeResizeProgression(): number[] {
    // return this.unitResizingStrategy.unitProgression.map(p => this.resizeRound(p * this.bettingUnit))
  // }

  getTrueCountType(): TrueCountType {
    if(this.betSpreadingStrategy.useHalfCount) {
      if(this.betSpreadingStrategy.roundingMethod === RoundingMethod.OFF) {
        return TrueCountType.HALF_ROUNDED;
      } else {
        return TrueCountType.HALF_FLOOR;
      }
    } else {
      return this.betSpreadingStrategy.roundingMethod === RoundingMethod.OFF
        ? TrueCountType.FULL_ROUNDED
        : TrueCountType.FULL_FLOOR;
    }
  }

  getTrueCount() {
    return this.shared.getTrueCount(this.trueCountType);
  }

  addSpot(id: number): void {
    this.spotIds.push(id);
  }

  sitInOrOut(): void {
    // A players can't sit out if he is the only player at the table
    // The check to see if a player is alone is in getBetSize
    // DOES THIS WORK? TODO - TEST !!!!!!
    this.shared.getSpotById(this.spotId).status = SpotStatus.TAKEN;
    if(this.betSize === 0) {
      this.shared.getSpotById(this.spotId).status = SpotStatus.RESERVED;
    }
  }

  abandonSpotById(spotId: number): void {
    this.spotIds = this.spotIds.filter(id => id !== spotId);
  }

  payBankroll(amount: number): void {
    this.bankroll = this.bankroll + amount;
    // console.log(this.handle + ' was paid ' + amount + '.Bankroll is now ' + this.bankroll);
  }

  setBetSize(): void {
    const roundBetToNearest = this.betSpreadingStrategy.roundBetToNearest;
    const indexes = Object.keys(this.betSpreadingStrategy.spreads).map(i => parseFloat(i));
    const minIndex: number = Math.min(...indexes);
    const maxIndex: number = Math.max(...indexes);
    const isOnlyPlayer = this.shared.getOccupiedActiveSpotCount() === 1;
    // The key depends on the round / floor methods for true count
    let key = parseFloat(this.getTrueCount());

    if(key < minIndex) {
      key = minIndex;
    }
    if(key > maxIndex) {
      key = maxIndex;
    }
    let betAmount = this.bettingUnit * this.betSpreadingStrategy.spreads[key];

    // I think this is for when a player wongs out completely / will have to do some testing to see
    // TODO - TEST AND POSSIBLY REIMPLEMENT WITH WONG TESTING
    // if(betAmount === 0 && !isOnlyPlayer) {
    //   this.betSize = 0;
    //   return this.betSize;
    // }
    // I think this is for when a player wongs out completely but is the only player.
    // At the end of this method, the betAmount will be table min

    // if(betAmount === 0 && isOnlyPlayer) {
    //   betAmount = 0;//this.getLowestNonZeroValue();
    // }

    if(roundBetToNearest === ChipTypeEnum.WHITE && betAmount % 1 !== 0) {
      betAmount = Math.round(betAmount);
    } else if(roundBetToNearest === ChipTypeEnum.RED && betAmount % 5 !== 0) {
      let amountToRound = 5 - (betAmount % 5)
      betAmount += (amountToRound < 2.5 ? amountToRound : (-1)*(betAmount % 5));
    } else if(betAmount % 1 !== 0) {
      betAmount += Math.round(betAmount);
    }
    betAmount = Math.min(this.shared.getConditions().maxBet, betAmount);
    betAmount = Math.max(this.shared.getConditions().minBet, betAmount);
    this.betSize = betAmount;
  }

  getColumnIndex(columnCount: number, percentNotDealt: number): number {
    let index = columnCount;
    while(((index / columnCount) >= percentNotDealt) && (index >= 0)) {
      index -= 1;
    }
    return columnCount - index - 1;
  }

  initializeRound(): void {
    this.setBetSize();
    if(this.shared.isFreshShoe()) {
      this.leaveAllWongSpots();
    }
    this.resizeUnit(); // add logic for minbet considering multiple spots played due to wonging and condition.AHMR - also make sure AHMR doesnt push past maxBet
    this.sitInOrOut();
    this.wongIn();
    this.tip();
    this.updateTotalBet();
    this.beginningTrueCount = this.getTrueCount();
  }

  updateTotalBet(): void {
    this.totalBet += [ ...this.wongSpotIds, this.spotId].length * this.betSize;
    this.amountBetPerHand += [ ...this.wongSpotIds, this.spotId].length * this.betSize;
  }

  incTotalBet(betSize: number): void {
    // used on split, double and insurance
    // TEST - should check against bankroll
    this.totalBet += betSize;
    this.amountBetPerHand += betSize;
  }

  finalizeRound(): void {
    // this.spotIds.forEach(id => this.shared.getSpotById(id).finalizeHand());
    this.amountBetPerHand = 0;
    // this.wongOut();
  }

  setWonFirstHandOfShoe(val: boolean): void {
    // UNTHOUGHT SIDE EVALUATIONS SHOULD LIVE IN THEIR OWN, WELL NAMED CLASS
    // this.wonFirstHandOfShoe = val;
  }

  resizeUnit(): void {
    // TODO - IMPLEMENT AND TEST AFTER THE APP WORKS WITHOUT IT
    // if(this.shared.isFreshShoe()) {
      // const increaseAtProgression = [ ...this.unitResizingStrategy.increaseAtProgression ];
    //   const decreaseAtProgression = [ ...this.unitResizingStrategy.decreaseAtProgression ];
    //   const resizeProgression = [ ...this.resizeProgression ];
    //   const currentIndex = resizeProgression.indexOf(this.bettingUnit);
    //   if(this.bankroll > increaseAtProgression[currentIndex] && resizeProgression[currentIndex + 1]) {
    //     this.bettingUnit = resizeProgression[currentIndex + 1]
    //   }
    //   if(decreaseAtProgression[currentIndex] && this.bankroll < decreaseAtProgression[currentIndex]) {
    //     this.bettingUnit = resizeProgression[currentIndex - 1]
    //   }
    // }
  }

  getLowestNonZeroValue(): void {
    // let lowest = null;
    // let concat = [];
    // this.betSpreadingStrategy.spreads
    //   .forEach(spread => concat = [ ...concat, ...Object.values(spread)]);
    // concat.filter(val => val > 0);
    // return Math.min(...concat);
  }

  tip(): void {
    // console.log(this.tippingStrategy);
    // TODO - IMPLEMENT AND TEST AFTER THE APP WORKS WITHOUT IT

    // const { tipToBetsizeRatios, maxTip, afterBlackjack, dealerJoins, dealerLeaves, tipFirstHandOfShoe,
    // playerIncreasesBet, everyXHands, tipSplitHandToo, doubleOnDouble, tipWongHands } = this.tippingStrategy;
    // if(tipToBetsizeRatios || maxTip) {
    //   const betSize = this.betSize;
    //   const ratio = tipToBetsizeRatios.find(ratio => ratio[1] >= betSize);
    //   this.tipSize = (ratio ? ratio[0] : maxTip) 
    //   const tipAmount = (tipWongHands ? this.tipSize * (this.wongSpotIds.length + 1) : this.tipSize) * (-1) ;
    //   const totalRoundsCount = this.shared.getTotalRoundsDealt();
    //   const handsPerDealer = this.shared.getConditions().handsPerDealer;
    //   if(afterBlackjack && this.hadBlackJackLastHand) {
    //     // console.log('TIPPING AFTER BLACKJACK', 'BETSIZE:', betSize, 'HANDS', this.wongSpotIds.length + 1, 'TIPSIZE:', tipAmount)
    //     this.payBankroll(tipAmount);
    //     this.tippedAway += (tipAmount * (-1));
    //   }
    //   if(totalRoundsCount % handsPerDealer === handsPerDealer - 1 && dealerLeaves) {
    //     // console.log('TIPPING dealerLeaves', 'BETSIZE:', betSize, 'HANDS', this.wongSpotIds.length + 1, 'TIPSIZE:', tipAmount)
    //     this.payBankroll(tipAmount);
    //     this.tippedAway += (tipAmount * (-1));
    //   } 
    //   if(totalRoundsCount % handsPerDealer === handsPerDealer && dealerJoins && totalRoundsCount !== 0) {
    //     // console.log('TIPPING dealerJoins', 'BETSIZE:', betSize, 'HANDS', this.wongSpotIds.length + 1, 'TIPSIZE:', tipAmount)
    //     this.payBankroll(tipAmount);
    //     this.tippedAway += (tipAmount * (-1));
    //   }
    //   if(this.shared.isFreshShoe() && tipFirstHandOfShoe) {
    //     // console.log('TIPPING tipFirstHandOfShoe', 'BETSIZE:', betSize, 'HANDS', this.wongSpotIds.length + 1, 'TIPSIZE:', tipAmount)
    //     this.payBankroll(tipAmount);
    //     this.tippedAway += (tipAmount * (-1));
    //   }
    //   if(playerIncreasesBet && this.betSizeLastHand < betSize) {
    //     // console.log('TIPPING playerIncreasesBet', 'BETSIZE:', betSize, 'HANDS', this.wongSpotIds.length + 1, 'TIPSIZE:', tipAmount)
    //     this.payBankroll(tipAmount);
    //     this.tippedAway += (tipAmount * (-1));
    //   }
    //   if(everyXHands && (totalRoundsCount % everyXHands) === 0 && totalRoundsCount !== 0) {
    //     // console.log('TIPPING everyXHands', 'BETSIZE:', betSize, 'HANDS', this.wongSpotIds.length + 1, 'TIPSIZE:', tipAmount);
    //     this.payBankroll(tipAmount);
    //     this.tippedAway += (tipAmount * (-1));
    //   }
    //   this.hadBlackJackLastHand = false;
    //   this.betSizeLastHand = betSize;
    // }
  }

  tipSplitHands(fromWong: boolean): void {
    // if(this.tippingStrategy.tipSplitHandToo && (!fromWong || fromWong && this.tippingStrategy.tipWongHands)) {
    //   this.payBankroll(this.tipSize * (-1));
    // }
  }

  doubleDealersTip(fromWong: boolean): void {
    // if(this.tippingStrategy.doubleOnDouble && (!fromWong || fromWong && this.tippingStrategy.tipWongHands)) {
    //   this.payBankroll(this.tipSize * (-1));
    // }
  }

  wongIn(): void { 
    // console.log(this.wongingStrategy);
    // TODO - IMPLEMENT AND TEST AFTER THE APP WORKS WITHOUT IT

    // if(this.wongingStrategy.length > 0 && this.wongSpotIds.length < this.wongingStrategy.length) {
    //   const percentNotDealt = Math.floor((this.shared.getDecksRemaining() / this.shared.getConditions().decksPerShoe) * 100)/ 100;
    //   const rowIndex = this.wongSpotIds.length;
    //   const trueCountTenth = this.shared.getHiLoTrueCountTenth();
    //   if(trueCountTenth >= this.wongingStrategy[rowIndex][columnIndex].enter) {
    //     this.addWongSpot();
    //   } 
    // }
  }

  addWongSpot(): void {
    // const playerSpots = [ ...this.wongSpotIds, this.spotId];
    // const minSpotId = Math.min( ...playerSpots);
    // const maxSpotId = Math.max( ...playerSpots);
    // let newSpotId = null;
    // if(minSpotId > 1 && this.shared.isSpotAvailable(minSpotId - 1)) {
    //   newSpotId = minSpotId - 1;
    // } else if(maxSpotId < this.shared.getConditions().spotsPerTable) {
    //   newSpotId = maxSpotId + 1;
    // }
    // if(newSpotId) {
    //   this.wongSpotIds.push(newSpotId);
    //   this.addSpot(newSpotId);
    //   const tableSpot: TableSpot = {
    //     status: SpotStatus.TAKEN,
    //     controlledBy: this.handle,
    //     id: null,
    //   }
    //   this.shared.getSpotById(newSpotId).initializeSpot(tableSpot);
    // }
  }

  wongOut(): void {  
    // if(this.wongingStrategy.length > 0 && this.wongSpotIds.length > 0 && this.wongSpotIds.length < this.wongingStrategy.length) {
    //   const percentNotDealt = Math.floor((this.shared.getDecksRemaining() / this.shared.getConditions().decksPerShoe) * 100)/ 100;
    //   const columns: number[] = this.wongingStrategy[0].map((s, i) => i);
    //   const columnIndex = this.getColumnIndex(columns.length,  percentNotDealt);
    //   const trueCountTenth = this.shared.getHiLoTrueCountTenth();
    //   const rowValues = this.wongingStrategy.map((ws) => ws[columnIndex].exit);
    //   this.wongSpotIds.forEach((id, i) => {
    //     if(trueCountTenth <= rowValues[i]) {
    //       this.leaveWongSpot(id);
    //     }
    //   });
    // }
  }

  leaveWongSpot(spotIdToLeave): void { 
    // // Dont leave a middle spot
    // let diff: number = 0;
    // let targetId: number;
    // this.wongSpotIds.forEach(id => {
    //   // Find the spot farthest away from the primary spot (not necessarily spotIdToLeave)
    //   if(Math.abs(this.spotId - id) > diff) {
    //     targetId = id;
    //     diff = Math.abs(this.spotId - id);
    //   }
    // });
    // this.shared.getSpotById(targetId).removePlayer()
    // this.wongSpotIds = this.wongSpotIds.filter(wsId => wsId !== spotIdToLeave);
  }

  leaveAllWongSpots(): void {
    // this.spotIds.filter(id => id !== this.spotId).forEach(id => this.shared.getSpotById(id).removePlayer())
    // this.spotIds = [this.spotId];
    // this.wongSpotIds = [];
  }
}