import { Injectable } from "@angular/core";
import { Order, orderqueryStagesarray, orderStages } from "../../models/Order";
import { firestore } from "firebase";
import * as moment from "moment";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotsService } from "./core/depots.service";
import { Depot } from "../../models/Depot";
import { ColNode } from "../../models/ColNode";
import { MatTreeNestedDataSource } from "@angular/material";
import { AngularFireFunctions } from "@angular/fire/functions";

@Injectable({
  providedIn: "root"
})
export class OrdersService {
  loadingorders = new BehaviorSubject(true);
  activedepot: Depot;
  orders: {
    [key in orderStages]: BehaviorSubject<Array<Order>>
  } = {
      1: new BehaviorSubject<Array<Order>>([]),
      2: new BehaviorSubject<Array<Order>>([]),
      3: new BehaviorSubject<Array<Order>>([]),
      4: new BehaviorSubject<Array<Order>>([]),
      5: new BehaviorSubject<Array<Order>>([]),
      6: new BehaviorSubject<Array<Order>>([])
    };
  queuedorders = new BehaviorSubject([]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(private db: AngularFirestore,
    private depotsservice: DepotsService,
    private functions: AngularFireFunctions) {
    this.depotsservice.activedepot.subscribe(depot => {
      this.unsubscribeAll();
      this.activedepot = depot;
      this.getpipeline(depot);
    });
  }

  createorder(order: Order): Promise<any> {
    order.Id = this.db.createId();
    /**
     * add a counter for the number of pending orders in the queue
     */
    this.queuedorders.value.push(order.Id);
    if (order.stage === 2) {
      return this.functions.httpsCallable("createorder")(order).toPromise().then(value => {
        /**
         * delete the orderid after the operation is complete
         */
        const index = this.queuedorders.value.indexOf(order.Id);
        if (index > -1) {
          this.queuedorders.value.splice(index, 1);
        }
      }).catch(reason => {
        /***
         * error creating order
         */
      });
    } else {
      return this.db.firestore.collection("depots")
        .doc(this.activedepot.Id)
        .collection("orders")
        .doc(order.Id)
        .set(order);
    }

  }


  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  updateorder(orderid: string, order: Order) {
    return this.db.firestore.collection("depots").doc(this.activedepot.Id).collection(`orders`).doc(orderid).update(order);
  }

  getorder(orderid: string) {
    return this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection("orders")
      .doc(orderid);
  }

  orderquery(query: any) {
    let queryvalue: any = this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection("orders");
    if (query.stagedata.status) {
      if (query.stagedata.invoiceno.status) {
        queryvalue = queryvalue.where("InvoiceId", "==", query.stagedata.invoiceno.value);
      }
      if (query.stagedata.stage.status) {
        queryvalue = queryvalue.where("stage", "==", query.stagedata.stage.value);
      }
      if (query.stagedata.user.status) {
        queryvalue = queryvalue
          .where(`stagedata.${query.stagedata.stage.value}.user.name`, "==", query.stagedata.stage.value);
      }
      if (query.stagedata.date.status && !query.stagedata.date.absolute) {
        queryvalue = queryvalue
          .where(`stagedata.${query.stagedata.stage.status ? query.stagedata.stage.value : 1}.user.time`, ">=", query.stagedata.date.range.from)
          .where(`stagedata.${query.stagedata.stage.status ? query.stagedata.stage.value : 1}.user.time`, "<=", moment(query.stagedata.date.range.to).endOf("day").toDate());
      }
      if (query.stagedata.date.status && query.stagedata.date.absolute) {
        queryvalue = queryvalue
          .where(`stagedata.${query.stagedata.stage.status ? query.stagedata.stage.value : 1}.user.time`, ">=", moment(query.stagedata.date.range.to).startOf("day").toDate())
          .where(`stagedata.${query.stagedata.stage.status ? query.stagedata.stage.value : 1}.user.time`, "<=", moment(query.stagedata.date.range.to).endOf("day").toDate());
      }
    }
    if (query.company.status) {
      if (query.company.QbId.status) {
        queryvalue = queryvalue.where("company.QbId", "==", query.company.QbId.value);
      }
      if (query.company.phone.status) {
        queryvalue = queryvalue.where("company.phone", "==", query.company.phone.value);
      }
      if (query.company.name.status) {
        queryvalue = queryvalue.where("company.name", "==", query.company.name.value);
      }
      if (query.company.krapin.status) {
        queryvalue = queryvalue.where("company.krapin", "==", query.company.krapin.value);
      }
      if (query.company.contact.phone.status) {
        queryvalue = queryvalue.where("company.contact.phone", "==", query.company.contact.phone.status);
      }
      if (query.company.contact.name.status) {
        queryvalue = queryvalue.where("company.contact.name", "==", query.company.contact.name.status);
      }
      if (query.company.contact.email.status) {
        queryvalue = queryvalue.where("company.contact.email", "==", query.company.contact.email.status);
      }
    }
    return queryvalue;
  }

  querybuild(node: MatTreeNestedDataSource<ColNode>) {
    let queryvalue: any = this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection("orders");
    node.data.forEach(colnode => {
      /**
       * Check if the node is activated for search
       */
      if (colnode.selected) {
        /**
         * Check if the node has children, characterized by a the data array being empty
         */
        if (colnode.children && colnode.children.length > 0) {
          /**
           * Explode the node... haha
           */
          colnode.children.forEach(child => {
            this.explodechildnode(child, queryvalue, colnode.nodename);
          });
        } else {
          /**
           * ignore activated empty nodes
           */
          if (colnode.searchvalue) {
            queryvalue = queryvalue.where(`${colnode.nodename}`, "==", colnode.searchvalue);
          }
        }
      }
    });
    console.log(queryvalue);
    return queryvalue;
  }

  /**
   * Recursively iterates over child nodes.
   * @description Should only be called with valid selected nodes
   * @param node
   * @param queryvalue
   * @param parentnode
   */
  explodechildnode(node: ColNode, queryvalue, parentnode: string) {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        /**
         * recursively iterate over all the children
         * Ignore nodes that are not selected
         */
        if (node.selected) {
          this.explodechildnode(child, queryvalue, parentnode + "." + node.nodename);
        }
      });
    } else {
      /**
       * Only search if a value had been typed
       */
      if (node.searchvalue && node.selected) {
        queryvalue = queryvalue.where(`${parentnode ? parentnode + "." + node.nodename : node.nodename}`, "==", node.searchvalue);
      }
    }
  }

  /**
   * Fetches all orders and trucks Relevant to the header
   */
  getpipeline(activedepot: Depot) {
    if (!activedepot.Id) {
      return;
    }
    /**
     * reset the trucks and orders array when this function is invoked
     */
    this.loadingorders.next(true);
    this.orders["1"].next([]);
    this.orders["2"].next([]);
    this.orders["3"].next([]);
    this.orders["4"].next([]);
    this.orders["5"].next([]);
    this.orders["6"].next([]);

    orderqueryStagesarray.forEach(stage => {

      const subscriprion = this.db.firestore.collection("depots")
        .doc(activedepot.Id)
        .collection("orders")
        .where("stage", "==", Number(stage))
        .orderBy("stagedata.1.user.time", "asc")
        .onSnapshot(snapshot => {

          /**
           * reset the array at the postion when data changes
           */
          this.orders[stage].next([]);
          /**
           * dont assign a value in case the query delayed and the depot changed before it returned a value
           */
          if (snapshot.empty || snapshot.docs[0].data().config.depot.Id !== activedepot.Id) {
            if (snapshot.empty) {
              this.loadingorders.next(false);
            }
            return;
          }
          this.loadingorders.next(false);
          this.orders[stage].next(snapshot.docs.filter(doc => {
            const value = doc.data() as Order;
            value.Id = doc.id;
            if (value.stage == 6 && (value.stagedata["1"].user.time instanceof firestore.Timestamp) && value.stagedata["1"].user.time.toDate() < moment().subtract(2, "w").toDate()) {
              doc.ref.delete();
              return false;
            } else {
              return true;
            }
          }).map(doc => {
            const value = doc.data() as Order;
            value.Id = doc.id;

            return value;
          }));
        }, err => {
          console.log(`Encountered error: ${err}`);
        });
      this.subscriptions.set(`orders${stage}`, subscriprion);

    });

    const startofweek = moment().startOf("week").toDate();

    /**
     * Fetch completed orders
     */
    const stage5subscription = this.db.firestore.collection("depots").doc(activedepot.Id).collection("orders")
      .where("stage", "==", 5)
      .where("stagedata.5.user.time", ">=", startofweek)
      .orderBy("stagedata.5.user.time", "desc")
      .onSnapshot(snapshot => {
        /**
         * dont assign a value in case the query delayed and the depot changed before it returned a value
         */
        if (snapshot.empty || snapshot.docs[0].data().config.depot.Id !== activedepot.Id) {
          if (snapshot.empty) {
            this.loadingorders.next(false);
          }
          return;
        }
        this.orders["5"].next(snapshot.docs.map(doc => {
          const value = doc.data();
          value.Id = doc.id;
          return value as Order;
        }));
      }, err => {
        console.log(`Encountered error: ${err}`);
      });
    this.subscriptions.set(`orders5`, stage5subscription);

  }

}
