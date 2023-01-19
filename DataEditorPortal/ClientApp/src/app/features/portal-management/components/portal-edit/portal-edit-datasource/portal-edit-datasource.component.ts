import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portal-edit-datasource',
  templateUrl: './portal-edit-datasource.component.html',
  styleUrls: ['./portal-edit-datasource.component.scss']
})
export class PortalEditDatasourceComponent implements OnInit {
  isSaving = false;
  datasourceConfig: any;

  dbTables: any[] = [];
  dbTableColumns: any[] = [];
  dbOrderOptions: any[] = [
    {
      label: 'ASC',
      value: 0
    },
    {
      label: 'DESC',
      value: 1
    }
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.datasourceConfig = {
      filters: [
        {
          field: 'name1',
          matchMode: 'contains',
          value: '123'
        },
        {
          field: 'name2',
          matchMode: 'contains',
          value: '456'
        }
      ],
      sortBy: [
        {
          field: 'name1',
          order: 0
        },
        {
          field: 'name2',
          order: 1
        }
      ]
    };
  }

  onTableNameChange(event: any) {
    console.log(event);
  }

  onSaveAndNext() {
    this.isSaving = true;
    setTimeout(() => {
      this.router.navigate(['../columns'], {
        relativeTo: this.activatedRoute
      });
    }, 1000);
  }

  onBack() {
    this.router.navigate(['../basic'], {
      relativeTo: this.activatedRoute
    });
  }
}
