import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { sendsms } from './tasks/sms/sms';
import { SMS } from './models/Daudi/sms/sms';
import { initCompanyInfo } from './tasks/crud/qbo/CompanyInfo/init';
import { OMC } from './models/Daudi/omc/OMC';
import { Config } from './models/Daudi/omc/Config';
import { Environment } from './models/Daudi/omc/Environments';
import { initFuels } from './tasks/crud/qbo/Item/Init';
import { Depot } from './models/Daudi/depot/Depot';
import { initDepots } from './tasks/crud/qbo/Class/init';
import { initTaxService } from './tasks/crud/qbo/tax/init';
import { createQbo } from './tasks/sharedqb';
import { createInvoice } from './tasks/crud/qbo/invoice/create';
import { Order } from './models/Daudi/order/Order';
import { createEstimate } from './tasks/crud/qbo/Estimate/create';
import { ordersms } from './tasks/sms/smscompose';
import { validorderupdate } from './validators/orderupdate';
import { MyTimestamp } from './models/firestore/firestoreTypes';
import { QuickBooks } from './libs/qbmain';
import { CompanySync } from "./models/Cloud/CompanySync";
import { processSync } from './tasks/syncdb/processSync';
import { readConfig } from './tasks/crud/daudi/readConfig';
import { DaudiCustomer } from './models/Daudi/customer/Customer';
import { updateCustomer } from './tasks/crud/qbo/customer/update';
import { OrderCreate } from './models/Cloud/OrderCreate';
import { creteOrder } from './tasks/crud/daudi/Order';

admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });


const alreadyRunEventIDs: Array<string> = [];

function isAlreadyRunning(eventID: string) {
  return alreadyRunEventIDs.indexOf(eventID) >= 0;
}

function markAsRunning(eventID: string) {
  alreadyRunEventIDs.push(eventID);
}
/**
 * create an estimate from the client directly
 */
exports.createEstimate = functions.https.onCall((data: OrderCreate, context) => {

  return createQbo(data.omcId, data.config, data.environment).then(async result => {
    console.log(result)
    const est = new createEstimate(data.order, result, data.config, data.environment)
    return result.createEstimate(est.formulateEstimate()).then(() => {
      /**
       * Only send sn SMS when estimate creation is complete
       * Make the two processes run parallel so that none is blocking
       */
      return Promise.all([ordersms(data.order), validorderupdate(data.order, result), creteOrder(data.order, data.omcId)])
    });
  })

});

/**
 * create an order from the client directly
 */
exports.approveInvoice = functions.https.onCall((data: OrderCreate, context) => {

  return createQbo(data.omcId, data.config, data.environment).then(async result => {
    console.log(result)
    const inv = new createInvoice(data.order, result, data.config, data.environment)
    return result.createInvoice(inv.formulateEstimate()).then(() => {
      /**
    * Only send sn SMS when order creation is complete
    * Make the two processes run parallel so that none is blocking
    */
      return Promise.all([ordersms(data.order), validorderupdate(data.order, result)]);
    });
  })

});


exports.customerUpdated = functions.firestore
  .document("/omc/{omcId}/customer/{customerId}")
  .onUpdate((snap, context) => {
    console.log(snap);
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      // A new customer has been updated
      const customerbefore = snap.before.data()
      if (!customerbefore) {
        return true;
      }
      if (customerbefore.QbId === null || customerbefore.QbId === '') {
        // this customer has just been created
        return true;
      }
      return readConfig(context.params.omcId)
        .then(val => {
          const config: Config = val.data() as Config
          const customer: DaudiCustomer = snap.after.data() as DaudiCustomer
          const env: Environment = customer.environment
          return createQbo(context.params.omcId, config, env).then(qbo => {
            return updateCustomer(customer, qbo);
          })
        })
    }
  });

/**
 * create a company from the client directly
 */
// exports.createcustomer = functions.https.onCall((data, context) => {
//   const company = data as Customer;
//   console.log(data);
//   return createCustomer(company);
// });
/**
 * Listens to when an sms object has been created in the database and contacts the 3rd party bulk SMS provider
 * @todo Add a callback for when the SMS is successfully sent and possibly when it's read
 */
exports.smscreated = functions.firestore
  .document("/sms/{smsID}")
  .onCreate((data, context) => {
    console.log(data);
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    }
    markAsRunning(eventID);
    return sendsms(data.data() as SMS, context.params.smsID);
  });

exports.requestsync = functions.https.onCall(((data: CompanySync, _) => {
  return createQbo(data.omc.Id, data.config, data.environment)
    .then((qbo: QuickBooks) => {
      return processSync(data.sync, qbo, data.omc.Id, data.config, data.environment);
    });
}))

exports.onUserStatusChanged = functions.database
  .ref("/admins/{uid}")
  .onUpdate((change, context) => {
    // Get the data written to Realtime Database
    const eventStatus = change.after.val();
    const eventID = context.eventId;
    if (isAlreadyRunning(eventID)) {
      console.log(
        "Ignore it because it is already running (eventId):",
        eventID
      );
      return true;
    } else {
      markAsRunning(eventID);
      // Then use other event data to create a reference to the
      // corresponding Firestore document.
      const userStatusFirestoreRef = admin
        .firestore()
        .doc(`admins/${context.params.uid}`);

      // It is likely that the Realtime Database change that triggered
      // this event has already been overwritten by a fast change in
      // online / offline status, so we'll re-read the current data
      // and compare the timestamps.
      return change.after.ref.once("value").then(statusSnapshot => {
        const status = statusSnapshot.val();
        console.log(status, eventStatus);
        return userStatusFirestoreRef.update({
          status: {
            online: status.online,
            time: MyTimestamp.now()
          }
        });
      });
    }
  });