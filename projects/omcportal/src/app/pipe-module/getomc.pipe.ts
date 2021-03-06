import {Pipe, PipeTransform} from "@angular/core";
import {CoreService} from "app/services/core/core.service";

@Pipe({
  name: "getomc"
})
export class GetomcPipe implements PipeTransform {

  constructor(private core: CoreService) {

  }

  transform(omcId: string): any {
    if (this.core.omcs.value.filter(omc => {
      return omc.Id === omcId;
    }).length !== 0) {
      return this.core.omcs.value.filter(admin => {
        return admin.Id === omcId;
      })[0].name;
    } else {
      return "";
    }
  }

}
