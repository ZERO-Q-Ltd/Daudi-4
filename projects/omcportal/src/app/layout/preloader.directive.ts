import {AfterViewInit, Directive, ElementRef, OnDestroy} from "@angular/core";
import {Event as RouterEvent, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";
import * as $ from "jquery";
import {Subscription} from "rxjs";
import {LayoutService} from "./layout.service";

@Directive({
  selector: "[myPreloader]"
})

export class PreloaderDirective implements AfterViewInit, OnDestroy {
  subscription: Subscription;
  $el;

  constructor(private el: ElementRef, private router: Router, private layoutService: LayoutService) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });

    this.subscription = layoutService.preloaderState$.subscribe((state) => {
      this.updatePreloader(state);
    });
  }

  ngAfterViewInit() {
    this.$el = $(this.el.nativeElement);
  }

  active() {
    if (this.$el) {
      this.$el.removeClass("hide").addClass("active");
    }
  }

  hide() {
    if (this.$el) {
      this.$el.addClass("hide").removeClass("active");
    }
  }

  // Shows and hides the saving spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.active();
    }
    if (event instanceof NavigationEnd) {
      this.hide();
    }

    // Set saving state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.hide();
    }
    if (event instanceof NavigationError) {
      this.hide();
    }
  }

  //
  updatePreloader(state) {
    // console.log('change state')
    if (state === "active") {
      this.active();
    }

    if (state === "hide") {
      this.hide();
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }
}
