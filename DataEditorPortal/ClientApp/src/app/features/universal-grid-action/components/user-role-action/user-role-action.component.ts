import { Component, OnInit } from '@angular/core';
import { NotifyService } from 'src/app/shared';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { RoleItem } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-user-role-action',
  templateUrl: './user-role-action.component.html',
  styleUrls: ['./user-role-action.component.scss']
})
export class UserRoleActionComponent
  extends GridActionDirective
  implements OnInit
{
  rolesArr: RoleItem[] = [];

  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService
  ) {
    super();
  }

  ngOnInit(): void {
    this.userManagerService
      .getUserRole(this.selectedRecords[0][this.recordKey])
      .subscribe(res => {
        this.rolesArr = res;
        this.loadedEvent.emit();
      });
  }

  onSave(): void {
    this.userManagerService
      .saveUserRole(this.rolesArr, this.selectedRecords[0][this.recordKey])
      .subscribe(res => {
        if (!res.isError) {
          this.notifyService.notifySuccess(
            'Success',
            'Save Successfully Completed.'
          );
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }
}
