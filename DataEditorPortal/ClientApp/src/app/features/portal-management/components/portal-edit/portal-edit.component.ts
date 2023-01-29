import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { switchMap, of } from 'rxjs';
import { PortalItemService } from '../../services/portal-item.service';

@Component({
  selector: 'app-portal-edit',
  templateUrl: './portal-edit.component.html',
  styleUrls: ['./portal-edit.component.scss']
})
export class PortalEditComponent implements OnInit {
  items!: MenuItem[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private portalItemService: PortalItemService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          return of(params.get('id') || '');
        })
      )
      .subscribe(val => {
        this.portalItemService.currentPortalItemId = val;
        this.router.navigate(['basic'], {
          relativeTo: this.activatedRoute,
          replaceUrl: true
        });
      });

    this.items = [
      {
        label: 'Basic',
        routerLink: 'basic'
      },
      {
        label: 'Data Source',
        routerLink: 'datasource'
      },
      {
        label: 'Grid Columns',
        routerLink: 'columns'
      },
      {
        label: 'Search Configration',
        routerLink: 'search'
      },
      {
        label: 'Add / Edit / View',
        routerLink: 'form'
      }
    ];
  }
}