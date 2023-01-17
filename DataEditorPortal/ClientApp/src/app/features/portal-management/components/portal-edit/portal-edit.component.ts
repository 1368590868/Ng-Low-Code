import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-portal-edit',
  templateUrl: './portal-edit.component.html',
  styleUrls: ['./portal-edit.component.scss']
})
export class PortalEditComponent implements OnInit {
  items!: MenuItem[];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
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

    // this.router.navigate(['basic'], { relativeTo: this.activatedRoute });
  }
}
