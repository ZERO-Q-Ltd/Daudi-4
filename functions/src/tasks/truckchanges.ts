// import { driverchangedsms, truckchangesdsms, trucksms } from "./sms/smscompose";
// import { truckFcm } from "./FCM/truckFcm";
// import * as orderCrud from './crud/daudi/Order'
// import { Truck } from "../models/Daudi/order/Truck";


// export function truckdatachanged(truckbefore: Truck, truckafter: Truck) {
//   const smsPromise = () =>
//     new Promise((resolver, reject) => {
//       if (truckafter.notifications.allowsms) {
//         /**
//          * SMS
//          */
//         if (truckbefore.stage < truckafter.stage) {
//           const promises: Array<Promise<any>> = [trucksms(truckafter)]
//           if (truckafter.stage === 4) {
//             promises.push(orderCrud.updateOrder(truckafter.config.depot.Id, truckafter.orderdata.OrderID, { stage: 5 }))
//           }
//           return Promise.all(promises)

//           // return trucksms(truckafter).then(() => {
//           //   if (truckafter.stage === 4) {
//           //     return orderCrud.updateOrder(truckafter.config.depot.Id, truckafter.orderdata.OrderID, { stage: 5 })
//           //   } else {
//           //     resolver(true)
//           //   }
//           // })
//         } else {
//           console.log("Stage not increased, ignoring ....");
//           return true
//         }
//       } else {
//         return (true);
//       }
//     });

//   const fmcPromise = () => {
//     if (truckafter.stage === 1) {
//       /**
//        * send different FCM depending on the truck stage movement
//        */
//       if (truckbefore.stage > truckafter.stage) {
//         return truckFcm(truckafter, "Reset");
//       } else if (truckbefore.stage < truckafter.stage) {
//         return truckFcm(truckafter, "Approved");
//       } else {
//         console.log("Truck data changed, but not affecting the stage");
//         return new Promise((resolver, reject) => {
//           return resolver;
//         });
//       }
//     } else {
//       return new Promise((resolver, reject) => {
//         resolver(true);
//       });
//     }
//   };

//   const truckChanges = () => {
//     /**
//      * Check truck changes
//      */
//     console.log(truckafter, truckbefore);
//     console.log(truckafter.drivername, truckbefore.drivername);
//     if (truckbefore.drivername !== truckafter.drivername) {
//       return driverchangedsms(truckafter);
//     } else if (truckbefore.numberplate !== truckafter.numberplate) {
//       return truckchangesdsms(truckafter);
//     } else {
//       console.log(
//         "Drivername and truck details not changed, ignoring change sms"
//       );
//       return new Promise((resolver, reject) => {
//         resolver(true);
//       });
//     }
//   };

//   return Promise.all([smsPromise(), fmcPromise(), truckChanges()]);
// }
