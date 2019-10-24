import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, MatTreeNestedDataSource } from "@angular/material";
import * as moment from "moment";
import { ActivatedRoute } from "@angular/router";
import { animate, sequence, state, style, transition, trigger } from "@angular/animations";
import { SendMsgComponent } from "../send-msg/send-msg.component";
import { emptytruck, Truck } from "../../models/Truck";
import { SMS } from "../../models/sms";
import { firestore } from "firebase";
import { ExcelService } from "../services/excel-service.service";
import { ColumnsCustomizerComponent } from "../columns-customizer/columns-customizer.component";
import { DepotsService } from "../services/core/depots.service";
import { ReplaySubject } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { OrdersService as OrderService } from "../services/orders.service";

@Component({
  selector: "trucks-table",
  templateUrl: "./trucks-table.component.html",
  styleUrls: ["./trucks-table.component.scss"],
  animations: [
    trigger("flyIn", [
      state("in", style({ transform: "translateX(0)" })),
      transition("void => *", [
        style({ height: "*", opacity: "0", transform: "translateX(-550px)", "box-shadow": "none" }),
        sequence([
          animate(".20s ease", style({ height: "*", opacity: ".2", transform: "translateX(0)", "box-shadow": "none" })),
          animate(".15s ease", style({ height: "*", opacity: 1, transform: "translateX(0)" }))
        ])
      ])
    ]),
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
    ])]
})
export class TrucksTableComponent implements OnInit {
  position = "above"; // for tooltip

  orders: any[];
  dialogProperties: object = {};
  dialogsections: number[] = [];
  activePage: any;
  stage: number;


  trucksdataSource = new MatTableDataSource<Truck>();

  truckcolumns = ["truckId", "time", "Print Status", "Phone", "orderCompanyName", "driverName", "driverId", "truckReg", "pmsQty", "agoQty", "ikQty"];

  temporder = {};
  loadingtrucks = true;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private excelService: ExcelService,
    private orderService: OrderService,
    private depotservice: DepotsService) {

    /**
     * propagate changes when depot changes
     */
    this.orderService.loadingorders.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
      this.loadingtrucks = value;
    });

    // this.route.params.pipe(takeUntil(this.comopnentDestroyed))
    //   .pipe(switchMap((paramdata: { stage: number }) => {
    // return this.truckservice.trucks[paramdata.stage].pipe(takeUntil(this.comopnentDestroyed));
    //   }))
    //   .subscribe((stagetrucks: Array<Truck>) => {
    //     this.trucksdataSource.data = stagetrucks;
    //   });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  exportAsExcelFile(): void {
    const dialogRef = this.dialog.open(ColumnsCustomizerComponent,
      {
        data: emptytruck,
        width: "70%",
        role: "dialog"
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        this.excelService.exportAsExcelFile(this.trucksdataSource.data, "Orders");
      }
    });
  }

  filtertrucks(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.trucksdataSource.filter = filterValue;
  }

  sendSMS(clickedtruck: Truck) {
    const sms: SMS = {
      Id: null,
      company: clickedtruck.company,
      type: {
        reason: null,
        origin: "custom"
      },
      greeting: "Jambo",
      msg: null,
      status: {
        delivered: false,
        sent: false
      },
      timestamp: firestore.Timestamp.now()
    };
    const dialogRef = this.dialog.open(SendMsgComponent, {
      role: "dialog",
      data: sms,
      height: "auto"
    });
    // this.dialog.open(SendMsgComponent);
  }

  resolvetime(timestamp) {
    return moment(timestamp.toDate()).fromNow();
  }


  ngOnInit() {
  }

  ngAfterViewInit() {
    this.trucksdataSource.paginator = this.paginator;
    this.trucksdataSource.sort = this.sort;
  }
}
