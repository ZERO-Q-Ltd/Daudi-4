
import { deepCopy } from "../../../models/utils/deepCopy";
import { MyTimestamp } from "../../firestore/firestoreTypes";
import { BaseStockModel } from "./BaseStockModel";
import { StockQty, EmptyStockQty } from "./StockQty";
import { StockRef } from "./StockRef";


export interface Entry extends BaseStockModel {
  entry: StockRef;
}

export const emptyEntry: Entry = {
  Id: null,
  fuelType: null,
  Amount: null,
  entry: {
    name: null,
    refs: []
  },
  price: 0,
  qty: deepCopy<StockQty>(EmptyStockQty),
  depot: {
    name: null,
    Id: null
  },
  active: false,
  date: new MyTimestamp(0, 0)
};
