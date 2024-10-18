import { PlayActionsEnum } from '../deviation-results/deviation-models';
import { 
  LocalStorageItemsEnum, 
  PlayerTableInfo, 
  PlayStrategy, 
  PlayStrategyCombo, 
  TrueCountType 
} from '../models';
import { LocalStorageService } from '../services/local-storage.service';

export class DeviationPlayer {
  handle: string;
  bettingUnit: number = 100;
  bankroll: number = 10000000000;
  playingStrategy: PlayStrategy | any;
  spotId: number;
  betSize: number = 100;
  trueCountType: TrueCountType = TrueCountType.FULL_ROUNDED; // This should be dynamic and come from the UI

  constructor(
    playerInfo: PlayerTableInfo, 
    private localStorageService: LocalStorageService,
    public playStrategySnippet: PlayStrategyCombo,
    public shared
  ){
    this.initializePlayer(playerInfo);
  }

  initializePlayer({ seatNumber, playerConfigTitle }: PlayerTableInfo): void {
    this.handle = playerConfigTitle;
    this.spotId = seatNumber;

    this.playingStrategy = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.PLAY,
      "deviationFinder"
    )};
    this.playingStrategy.combos = { ...this.localStorageService.getItemOfItems(
      LocalStorageItemsEnum.PLAY,
      "deviationFinder"
    ).combos };
    const comboKey = Object.keys(this.playStrategySnippet)[0];
    let splitComboKey: string;
    if(this.handle === 'Split') {
      const cards = comboKey.split('-')[1];
      if(cards === 'TT') {
        splitComboKey = `${comboKey.split('-')[0]}-20`
      } else if(cards === `AA`) {
        splitComboKey = `${comboKey.split('-')[0]}-A2`; // This could probably stay forever, but its not technically correct
      } else {
        splitComboKey = `${comboKey.split('-')[0]}-${(parseInt(cards.split('')[0]) * 2).toString()}`;
      }
    }
    const combinedKey = splitComboKey || comboKey;
    const combinedSnippet: PlayStrategyCombo = {
      [comboKey]: {
        conditions: `? ${this.playingStrategy.combos[combinedKey].conditions}`,
        options: `${this.playStrategySnippet[comboKey].options} ${this.playingStrategy.combos[combinedKey].options}`,
      }
    }
    this.playingStrategy.combos[comboKey] = { ...combinedSnippet[comboKey] };
  }

  payBankroll(amount: number): void {
    const actionKey: PlayActionsEnum = this.handle.toLowerCase() as PlayActionsEnum;
    const trueCountDeviationKey: string = this.shared.getTrueCountDeviationKey(actionKey);
    this.shared.updateResultsAmountWon(amount, trueCountDeviationKey, actionKey);
  }
}