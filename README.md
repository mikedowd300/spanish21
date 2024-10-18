# Spanish21

This app will
1 - Deal a casino style game of American Spanish 21 (Not Pontoon)
  -- Spanish 21 dealer will always have hole card dealt
2 - Have configurable rules and conditions to simulate any casino
  - A default config will be hard coded but other configurations will exist in local storage
3 - The shoe will be made of Spanish21 decks
  - Will have options for different number of decks in shoe (deterined by configuration)
  - Initially will be programatically created and shuffled randomly
  - Will be saved in local storage after every shuffle
  - Will have a shuffle point determined by the users conditions configuration
  - Will keep track of the running count
  -- The wizard of odds had a counting System
  -- Katarina Walker had a counting system as well
  -- HiLo count
4 - The default play table will be based on Katarina Walker's play strategies
5 - Different modes will exist for the count (the desired count will be in the game configuration )
  - Show the count
  - Hide the count
7 - Different modes will exist for practice
  - Show the proper action BEFORE the player acts
  - Show the proper action if the layer selects the wrong action and give the option to change
  - Show the proper action if the layer selects the wrong action with no option to change
  - Don't consider the proper action, just do as the player wants  
8 - Beyond MVP
  - add configurable straties for bet spreads - incudes hardcoded default strategy
  - add configurable straties for unit resizing - incudes hardcoded default strategy
  - add configurable straties for wonging - incudes hardcoded default strategy
  - add configurable straties for tipping - incudes hardcoded default strategy
  - add configurable straties for playing  - incudes hardcoded default strategy
  - add default player configuration that contains the default of the above strategies
  - add configurable players
  -- name
  -- starting bankroll
  -- betting unit
  - add tab
  
  Story 1 - Create Local Storage Service 
  - Store and retrieve items in local storage based on item name
  - When storing, over write the existing value

  Story 2 - Create Shoe as a class inside of sp21engine folder
  - Shoe keeps count for HiLo
  - Count may be kept for fractions of TC
  - method to deal single card
  - method to shuffle
  - method to retrieve from local storage
  - method to place into local storage 
  - store decks in local storage
  - shoes in local storage will look like:
  shoes: {
    '4-deck': [cards],
    '6-deck': [cards],
    '8-deck': [cards],
  }

Story 3 - Conditions
- Create model
- Create conditions UI
- Create default conditions JSON object
- Create seed object for local storage (strategy TBD)
- Implement shoe specific conditions into shoe 

Story 4 - Tipping Strategy
- Create model
  -- Amount
  -- after blackjack
  -- new dealer
  -- new shoe
  -- dealer leaves
  -- every x hands
  -- include tip with split
  -- include tip with double
  -- increase tip with betsize
- Create tipping UI
- Create default tipping JSON object - no tip
- Create default tipping JSON object - Cheap tipper
- Create seed object for local storage (strategy TBD)
- add to local storage "tipping" item
  -- readable from local storage
  -- editable
  -- deleteable

Story 5 - Playing Strategy
- Create model
- Create Playing UI
- Create default strategy JSON object - basic strategy
- Create seed object for local storage (strategy TBD)
- add local storage item key with
  -- readable from local storage
  -- editable
  -- deleteable

Story 6 - Bet Spread Strategy 
- Spread same for all portions of the deck
- Create model
- Create Bet Spread UI
- Create default strategy JSON object - No Spread
- Create seed object for local storage (Spread 1 - 6)

Story 7 - Bet Resize Strategy 
- Resize Strategy Based on Bankroll
- Strategies should reduce risk (drop ROR) as units resize up
- Create model
- Create Resize UI
- Create default strategy JSON object - Never Resize
- Create seed object for local storage (Simple resize strategy)

Story 8 - Wong Strategy 
- Same Wong Strategy for all portions of the deck
- Create model
- Create Wong UI
- Create default Wong strategy JSON object - no wonging
- Create seed object for local storage (Simple single hand wong in - wong out)

Story 9 - Create Player Config
- Create model
  -- Name
  -- Bankroll
  -- bettingUnit
  -- tipping strategy
  -- playing strategy
  -- bet spread strategy
  -- bet resize strategy
  -- wonging strategy
- Create Player UI
- Create default Wong strategy JSON object - no wonging
- Create seed object for local storage (Simple player with default strategies)

Story 10 - Create Table Config
- Create model
-- Table Conditions
-- Players
- Create Wong UI
- Create default Wong strategy JSON object - no wonging
- Create seed object for local storage (Simple single hand wong in - wong out)

Story (Sub Epic) 11 - Implement game Logic
- Same game logic used in both modes
-- Practice Mode
-- Sim Mode

Story 11.1 - Card Class (started in Shoe Story)

Story 11.2 - Hand Class

Story 11.3 - DealerHand Class

Story 11.4 - Player Class 
- made from Players Config
- includes tracking Player's Hand history

Story 11.5 - Spot Manager - maps spots to players

Story 11.6 - Table
- Made from Table Config
- Includes Players
- Includes Spot Manager
- Includes Game History





