import { Component, OnInit } from '@angular/core';
import { NotifyService } from 'src/app/core/utils/notify.service';
import { GridActionDirective } from '../../directives/grid-action.directive';
import { UserPemissions } from '../../models/user-manager';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission-action.component.html',
  styleUrls: ['./user-permission-action.component.scss']
})
export class UserPermissionComponent
  extends GridActionDirective
  implements OnInit
{
  groupPermissions: any[] = [];
  permissionSelect: UserPemissions[] = [];
  permissions: any[] = [];
  constructor(
    private userManagerService: UserManagerService,
    private notifyService: NotifyService
  ) {
    super();
  }

  getPermissionsList(id = '') {
    this.userManagerService.getUserPermissions(id).subscribe(res => {
      this.groupPermissions = this.groupBy(res);
      this.groupPermissions.map((item, i) => {
        this.permissions[i] = item;
      });
      this.permissions.map((res, i) => {
        this.permissionSelect[i] = res.filter((item: any) => {
          return item.selected;
        });
      });
      this.loadedEvent.emit();
    });
  }

  // format data
  groupBy(objectArray: any[]) {
    const map = new Map();
    objectArray.forEach((item, _, arr) => {
      if (!map.has(item.category)) {
        map.set(
          item.category,
          arr.filter(a => a.category == item.category)
        );
      }
    });
    return Array.from(map).map(item => [...item[1]]);
  }

  // dialog function

  ngOnInit(): void {
    this.getPermissionsList(this.selectedRecords[0][this.recordKey]);
  }

  onSave(): void {
    this.permissionSelect = this.permissionSelect.flat(3).map(res => {
      {
        res.selected = true;
        return res;
      }
    });
    this.userManagerService
      .saveUserPermissions(
        this.permissionSelect,
        this.selectedRecords[0][this.recordKey]
      )
      .subscribe(res => {
        if (!res?.isError) {
          this.notifyService.notifySuccess(
            'Success',
            'Permissions saved successfully'
          );
          this.savedEvent.emit();
        } else {
          this.errorEvent.emit();
        }
      });
  }
}
