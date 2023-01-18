import { Component } from '@angular/core';
import { GridActionDirective } from '../../directives/grid-action.directive';

@Component({
  selector: 'app-user-role-action',
  templateUrl: './user-role-action.component.html',
  styleUrls: ['./user-role-action.component.scss']
})
export class UserRoleActionComponent extends GridActionDirective {
  rolesArr = [
    { key: '', checked: true, label: 'Admin', value: 'Admin' },
    { key: '', checked: false, label: 'User', value: 'User' },
    { key: '', checked: false, label: 'Guest', value: 'Guest' }
  ];

  constructor() {
    super();
  }
}
