import { TableConfig } from "../models";

export const defaultTable: TableConfig = {
  title: "Default Table",
  players: [
    {
      seatNumber: 4,
      playerConfigTitle: 'Ploppy 1'
    },
    {
      seatNumber: 5,
      playerConfigTitle: 'Ploppy 2'
    }
  ],
  conditionsTitle: "Default Conditions",
};

export const tableTitles: string[] = ["Default Table"];

export  const defaultTables: { [k: string]: TableConfig } = {
  "Default Table": defaultTable,
}