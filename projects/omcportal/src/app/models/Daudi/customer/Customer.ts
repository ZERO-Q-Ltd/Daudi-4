import { MyGeoPoint } from "../../firestore/firestoreTypes";
import { AssociatedUser } from "../admin/AssociatedUser";
import { CustomerDetail } from "./CustomerDetail";
import { firestore } from 'firebase';

export interface DaudiCustomer extends CustomerDetail {
  Active: boolean;
  location: firestore.GeoPoint;
  kraverified: {
    status: boolean
    user: AssociatedUser,
  };
  balance: number;
}

export const emptyDaudiCustomer: DaudiCustomer = {
  Active: null,
  contact: [],
  Id: null,
  name: null,
  QbId: null,
  /**
   * make default location Somewhere in nbi
   */
  location: new firestore.GeoPoint(-1.3088567, 36.7752539),
  krapin: null,
  kraverified: {
    status: null,
    user: null
  },
  balance: 0
};
