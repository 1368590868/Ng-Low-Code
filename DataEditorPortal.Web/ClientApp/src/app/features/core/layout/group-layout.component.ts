import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigDataService, SiteMenu } from 'src/app/shared';

@Component({
  selector: 'app-group-layout',
  template: ` <router-outlet></router-outlet> `
})
export class GroupLayoutComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private configDataService: ConfigDataService
  ) {}

  group?: SiteMenu;

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.group = data['group'];
      // this.configDataService.menuGroupChange$.next(this.group);
    });
  }
}
