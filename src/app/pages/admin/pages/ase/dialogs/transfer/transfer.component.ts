import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { CoreService } from 'app/services/core/core.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Depot } from '../../../../../../models/Daudi/depot/Depot';
import { Entry } from '../../../../../../models/Daudi/fuel/Entry';
import { FuelType } from '../../../../../../models/Daudi/fuel/FuelType';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
    privateDepots: Depot[] = [];
    selectedDepot: Depot;
    depotEntries: MatTableDataSource<Entry> = new MatTableDataSource<Entry>([]);
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    displayedColumns: string[] = ['select', 'id', 'date', 'entry', 'totalqty', 'transferqty', 'loadedqty', 'availableqty', 'status'];
    selection = new SelectionModel<Entry>(true, []);

    constructor(
        @Inject(MAT_DIALOG_DATA) private fuelType: FuelType,
        private core: CoreService) {
        this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
            /**
             * Only allow fuel to be transferred to a private depot
             */
            this.privateDepots = depots.filter(d => d.config.private);
        });
        this.core.depotEntries[fuelType].pipe(takeUntil(this.comopnentDestroyed)).subscribe(entries => {
            this.depotEntries.data = entries;
        });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: Entry): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.entry.name}`;
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.depotEntries.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.depotEntries.data.forEach(row => this.selection.select(row));
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }

}