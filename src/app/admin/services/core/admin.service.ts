import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin, emptyadmin } from "../../../models/admin/Admin";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import * as moment from "moment";
import { User } from "../../../models/universal/User";
import { firestore } from "firebase";
import { Router } from "@angular/router";
import { AngularFireDatabase } from "@angular/fire/database";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AdminService {
  /**
   * The only source of truth
   */
  observableuserdata = new ReplaySubject<Admin>(1);
  /**
   * Secondary copy of data to avoid many unnecessary subscriptions
   */

  userdata: Admin = { ...emptyadmin };


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, router: Router) {
    afAuth.authState.subscribe(state => {
      if (state) {
        this.getuser(afAuth.auth.currentUser);
        // this.init(afAuth.auth.currentUser);
      } else {
        this.userdata = { ...emptyadmin };
        if (router.routerState.snapshot.url !== "/admin/login") {
          router.navigate(["/admin/login"]);
        }
        this.observableuserdata.next(null);
      }
    });

    this.observableuserdata.subscribe(userdata => {
      this.userdata = userdata;
    });
  }

  /**
   * make the user go offline before logging out
   */
  logoutsequence() {
    this.db.firestore.collection("admin").doc(this.userdata.Id).update({
      status: {
        online: false,
        time: moment().toDate()
      }
    }).then(res => {
      this.afAuth.auth.signOut();
    });
  }

  getalladmins() {
    return this.db.firestore.collection("admin")
      .where("Active", "==", true);
  }

  /**
   * Creates a user object for use within orders and trucks
   */
  createuserobject(): User {
    return {
      name: this.userdata.profile.name,
      uid: this.userdata.profile.uid,
      time: firestore.Timestamp.now()
    };
  }

  updateadmin(adminid: string) {
    return this.db.firestore.collection("admin").doc(adminid);
  }

  getuser(user, unsub?: boolean) {
    const unsubscribe = this.db.firestore.collection("admin").doc(user.uid)
      .onSnapshot(userdata => {
        if (userdata.exists) {

          const temp: Admin = Object.assign({}, { ...emptyadmin }, userdata.data());
          temp.profile.email = user.email;
          temp.profile.name = user.displayName;
          temp.profile.photoURL = user.photoURL;
          temp.Id = user.uid;
          this.userdata = temp;
          this.observableuserdata.next(temp);
          console.log(temp);
        } else {
          console.log("User not found!!");
          this.observableuserdata.next(null);
        }

      }, err => {
        console.log(`Encountered error: ${err}`);
      });
    if (unsub) {
      unsubscribe();
    }
  }

  init(user: firebase.User) {
    const temp: Admin = { ...emptyadmin };
    temp.profile.email = user.email;
    temp.profile.name = user.displayName;
    temp.profile.photoURL = user.photoURL;
    temp.Id = user.uid;
    this.db.firestore.collection("admin").doc(user.uid).set(temp);

  }

  unsubscribeAll() {
    this.getuser(null);
  }
}
