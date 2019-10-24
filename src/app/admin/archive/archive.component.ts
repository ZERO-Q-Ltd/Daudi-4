import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatSnackBar, MatTreeNestedDataSource } from "@angular/material";
import { FormControl } from "@angular/forms";
import { NestedTreeControl } from "@angular/cdk/tree";
import { emptyorder } from "../../models/Order";
import { emptytruck } from "../../models/Truck";
import { ReplaySubject } from "rxjs";


@Component({
  selector: "app-archive",
  templateUrl: "./archive.component.html",
  styleUrls: ["./archive.component.scss"]
})
export class ArchiveComponent implements OnInit, OnDestroy {
  position = "above";

  minDate = new Date(2017, 8, 26);
  maxDate = new Date();

  date = new FormControl(new Date());
  searchinit = false;

  dataobject = {};
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {
    this.changedatamodel(0);
  }

  initvalues() {
  }



  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  toggleselection() {

  }

  changedatamodel(index: number) {
    switch (index) {
      case 0:
        this.dataobject = { ...emptyorder };
        this.initvalues();
        break;
      case 1:
        this.dataobject = { ...emptytruck };
        this.initvalues();
        break;
    }
  }

  search() {

  }

}
