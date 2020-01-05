import { FuelType } from "../fuel/FuelType";

import { Environment } from "./Environments";
import { TaxExempt, emptytaxExempt } from "./TaxExempt";
import { deepCopy } from "../../utils/deepCopy";

export interface OMCStock {
    qty: {
        [pkey in Environment]:
        { [key in FuelType]: {
            allocation: number;
            /**
             * Total amount of ASE in KPC depots
             */
            ase: {
                totalActive: number,
                used: number
            },
            entry: {
                totalActive: number,
                used: number
            }
        }; }
    };
    taxExempt: {
        [key in Environment]: {
            [subKey in FuelType]: TaxExempt
        }
    };
}

export const EmptyOMCStock: OMCStock = {
    qty: {
        live: {
            ago: {
                allocation: 0,
                ase: {
                    used: 0,
                    totalActive: 0
                },
                entry: {
                    used: 0,
                    totalActive: 0
                }
            },
            ik: {
                allocation: 0,
                ase: {
                    used: 0,
                    totalActive: 0
                },
                entry: {
                    used: 0,
                    totalActive: 0
                }
            },
            pms: {
                allocation: 0,
                ase: {
                    used: 0,
                    totalActive: 0
                },
                entry: {
                    used: 0,
                    totalActive: 0
                }
            }
        },
        sandbox: {
            ago: {
                allocation: 0,
                ase: {
                    used: 0,
                    totalActive: 0
                },
                entry: {
                    used: 0,
                    totalActive: 0
                }
            },
            ik: {
                allocation: 0,
                ase: {
                    used: 0,
                    totalActive: 0
                },
                entry: {
                    used: 0,
                    totalActive: 0
                }
            },
            pms: {
                allocation: 0,
                ase: {
                    used: 0,
                    totalActive: 0
                },
                entry: {
                    used: 0,
                    totalActive: 0
                }
            }
        }
    },
    taxExempt: {
        live: {
            ago: deepCopy<TaxExempt>(emptytaxExempt),
            ik: deepCopy<TaxExempt>(emptytaxExempt),
            pms: deepCopy<TaxExempt>(emptytaxExempt)
        },
        sandbox: {
            ago: deepCopy<TaxExempt>(emptytaxExempt),
            ik: deepCopy<TaxExempt>(emptytaxExempt),
            pms: deepCopy<TaxExempt>(emptytaxExempt)
        }
    },
};
