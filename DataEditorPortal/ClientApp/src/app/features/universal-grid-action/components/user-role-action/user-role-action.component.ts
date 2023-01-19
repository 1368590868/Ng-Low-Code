import { Component } from '@angular/core';
import {
  GridActionDirective,
  OnGridActionDialogShow
} from '../../directives/grid-action.directive';
import { RoleList } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager-services/user-manager.service';

@Component({
  selector: 'app-user-role-action',
  templateUrl: './user-role-action.component.html',
  styleUrls: ['./user-role-action.component.scss']
})
export class UserRoleActionComponent
  extends GridActionDirective
  implements OnGridActionDialogShow
{
  rolesArr: RoleList[] = [];

  constructor(private userManagerService: UserManagerService) {
    super();
  }

  onDialogShow(): void {
    this.userManagerService
      .getUserRole(this.selectedRecords[0][this.recordKey])
      .subscribe(res => {
        this.rolesArr = res;
        this.loadedEvent.emit();
      });
  }
}
