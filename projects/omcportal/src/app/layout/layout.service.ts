import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable()
export class LayoutService {
  private preloaderStateSource = new Subject<string>();

  preloaderState$ = this.preloaderStateSource.asObservable();
  private searchOverlaySource = new Subject<string>();
  searchOverlayState$ = this.searchOverlaySource.asObservable();
  private echartsSource = new Subject<boolean>();
  echartsState$ = this.echartsSource.asObservable();

  updatePreloaderState(state: string) {
    // console.log('preloader state: ' + state)
    this.preloaderStateSource.next(state);
  }

  updateSearchOverlayState(state: string) {
    // console.log('overlay state: ' + state)
    this.searchOverlaySource.next(state);
  }

  updateEChartsState(state: boolean) {
    // console.log('echarts state: ' + state)
    this.echartsSource.next(state);
  }
}
