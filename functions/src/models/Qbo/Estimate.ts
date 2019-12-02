import { BillAddr } from "./subTypes/BillAddr";
import { ShipAddr } from "./subTypes/ShipAddr";
import { Line } from "./subTypes/Line";
import { QboMetaData } from "./subTypes/QboMetaData";
import { CustomField } from "./subTypes/CustomField";
import { TxnTaxDetail } from "./subTypes/TxnTaxDetail";
import { PrintStatus } from "./enums/PrintStatus";
import { TxnStatus } from "./enums/TxnStatus";
import { CustomerMemo } from "./subTypes/CustomerMemo";
import { CustomerRef } from "./subTypes/CustomerRef";
import { BillEmail } from "./subTypes/BillEmail";

export interface Estimate {

    /**
     *  filterable , sortable
    Reference number for the transaction.
     DocNumber is required for France locale if Preferences:CustomTxnNumber is enabled and will not be be automatically generated. 
    If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows:
    If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null.
    If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1.
    If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. 
    If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber.
     */
    DocNumber?: string;
    /**
     * Version number of the object. It is used to lock an object for use by one app at a time. 
     * As soon as an application modifies an object, its SyncToken is incremented. 
     * Attempts to modify an object specifying an older SyncToken fails. 
     * Only the latest version of the object is maintained by QuickBooks Online.
     */
    SyncToken?: string;
    domain: "QBO";
    TxnStatus: TxnStatus;
    BillEmail: BillEmail;
    TxnDate?: string;
    TotalAmt?: number;

    CustomerRef: CustomerRef;
    CustomerMemo?: CustomerMemo;
    ShipAddr?: ShipAddr;
    PrintStatus: PrintStatus;

    BillAddr?: BillAddr;
    sparse?: boolean;
    EmailStatus: string;
    Line: Line[];
    ApplyTaxAfterDiscount?: boolean;
    CustomField: CustomField[];
    /**
     * Unique identifier for this object. Sort order is ASC by default
     */
    Id?: string;
    TxnTaxDetail: TxnTaxDetail;
    MetaData?: QboMetaData;
    /**
     * User entered, organization-private note about the transaction. 
     * This note does not appear on the invoice to the customer. 
     * This field maps to the Memo field on the Invoice form
     */
    PrivateNote?: string
}
