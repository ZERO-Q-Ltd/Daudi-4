import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { ColumnsCustomizerComponent } from 'app/components/columns-customizer/columns-customizer.component';
import { SendMsgComponent } from 'app/components/send-msg/send-msg.component';
import { CoreService } from 'app/services/core/core.service';
import { DepotService } from 'app/services/core/depot.service';
import { ExcelService } from 'app/services/excel-service.service';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Order } from '../../models/Daudi/order/Order';
import { emptytruck, Truck } from '../../models/Daudi/order/truck/Truck';
import { SMS } from '../../models/Daudi/sms/sms';
import { MyTimestamp } from '../../models/firestore/firestoreTypes';

@Component({
    selector: "trucks-table",
    templateUrl: './trucks-table.component.html',
    styleUrls: ['./trucks-table.component.scss'],
    animations: [
        trigger('flyIn', [
            state('in', style({ transform: 'translateX(0)' })),
            transition('void => *', [
                style({ height: '*', opacity: '0', transform: 'translateX(-550px)', 'box-shadow': 'none' }),
                sequence([
                    animate('.20s ease', style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none' })),
                    animate('.15s ease', style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
                ])
            ])
        ]),
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])]
})
export class TrucksTableComponent implements OnInit {
    position = 'above'; // for tooltip

    orders: any[];
    dialogProperties: object = {};
    dialogsections: number[] = [];
    activePage: any;
    stage: number;

    trucksdataSource = new MatTableDataSource<Truck>();

    truckcolumns = ['truckId', 'time', 'Print Status', 'Phone', 'orderCompanyName', 'driverName', 'driverId', 'truckReg', 'pmsQty', 'agoQty', 'ikQty'];

    temporder = {};
    loadingtrucks = true;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private core: CoreService,
        private depotservice: DepotService) {

        /**
         * propagate changes when depot changes
         */
        this.core.loaders.orders.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
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
                width: '70%',
                role: 'dialog'
            });
        dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
            if (result) {
                this.excelService.exportAsExcelFile(this.trucksdataSource.data, 'Orders');
            }
        });
    }

    filtertrucks(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.trucksdataSource.filter = filterValue;
    }

    sendSMS(clickedOrder: Order) {
        const sms: SMS = {
            Id: null,
            company: clickedOrder.customer,
            type: {
                reason: null,
                origin: 'custom'
            },
            contact: clickedOrder.customer.contact,
            greeting: 'Jambo',
            msg: null,
            status: {
                delivered: false,
                sent: false
            },
            timestamp: MyTimestamp.now()
        };
        const dialogRef = this.dialog.open(SendMsgComponent, {
            role: 'dialog',
            data: sms,
            height: 'auto'
        });
        // this.dialog.open(SendMsgComponent);
    }

    resolvetime(MyTimestamp) {
        return moment(MyTimestamp.toDate()).fromNow();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.trucksdataSource.paginator = this.paginator;
        this.trucksdataSource.sort = this.sort;
    }
}