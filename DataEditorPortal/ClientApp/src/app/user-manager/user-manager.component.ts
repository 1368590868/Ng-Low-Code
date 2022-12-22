import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AppDataService, SearchDetailResult } from '../services/app-data.service';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { UserManagerDialogs } from './user-manager-dialogs.component';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.css']
})
export class UserManagerComponent {
  @ViewChild(UserManagerDialogs) userManagerDialog; 
  user: any; 
  constructor(private userService: UserService,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService
) { 
    this.user = userService.USER;
    console.log('user', this.user); 
  }



  isLoading = false;
  totalRecords = 0;
  searchClicked: boolean = false; 
  userrecords: any[];
  selectedItem: any[];
  checkedCount = 0;
  checkedState = {};
  checkedItems = [];
  checkedItemsList = "";

  
  searchParams: any;
  gridParam: any; 
  destroy$ = new Subject<void>();

  
  cols: any[] = [
    { field: 'USERID', header: 'CNP ID', width: '130px', filterType: 'text' },
    { field: 'NAME', header: 'Name', width: '250px', filterType: 'text' },
    { field: 'EMAIL', header: 'Email', width: '250px', filterType: 'text' },
    { field: 'PHONE', header: 'Phone', width: '250px', filterType: 'text' },
    { field: 'AUTO_EMAIL', header: 'Auto Email', width: '250px', filterType: 'text' },
    { field: 'VENDOR', header: 'Vendor', width: '250px', filterType: 'text' },
    { field: 'EMPLOYER', header: 'Employer', width: '250px', filterType: 'text' },
    { field: 'DIVISION', header: 'Division', width: '250px', filterType: 'text' },
    { field: 'COMMENTS', header: 'Comments', width: '250px', filterType: 'text' }
  ];


  ngOnInit() {
    // this.fetchData();
    console.log('init');
    this.userrecords = []; 

    this.appDataService.searchClicked$.pipe(
      tap(searchParams => {

          this.searchClicked = false; 
          this.fetchData(searchParams);
          this.searchParams = searchParams;
        
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public refreshData()
  {
      this.fetchData(this.searchParams, this.gridParam); 
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  


      
  }

  openManageRoles()
  {
    this.userManagerDialog.ManageRoleInit(); 
  }
  openNewUser()
  {
    this.userManagerDialog.AddNewInit(); 
  }
  openEdit(data)
  {
    this.userManagerDialog.editInit(data); 
  }

    initCheckState(isChecked: boolean) {
    const data = this.userrecords || [];
    this.checkedState = data.reduce((checkedState, e) => {
      checkedState[e['USERID']] = isChecked;
      return checkedState;
    }, {});
    this.checkedCount = this.getCheckedItems()?.length;
  }
  toggleCheckState(item: any) {
    if (!item || !item['USERID']) {
      return;
    }
    const currentCheckState = this.checkedState[item['USERID']];
    this.checkedState[item['USERID']] = !currentCheckState;
    this.checkedCount = this.getCheckedItems()?.length;
  }
  getCheckedItems() {
    return this.userrecords.filter(e => !!this.checkedState[e['USERID']]);
  }
  getCheckedItemsList() {
    return this.checkedItems?.map(e => e.USERID).join(', ');
  }
  
onLazyLoad(event: any) {
  console.log('onLazyLoad', event);

  // reset state
  if (this.searchParams && this.searchClicked)
  {
  this.gridParam = event; 

  this.fetchData(this.searchParams, event);
  }

  
}


fetchData(searchParams: any, state?: any) {
  console.log('fetchData', searchParams, state);

  this.isLoading = true;
  this.userService.fetchData(searchParams, state).pipe(
    tap(result => {
      console.log('result', result);
      this.userrecords = result['Data']  || [];
      this.searchClicked = true; 
      this.initCheckState(false);
      this.totalRecords = result['Total'];
     
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    finalize(() => this.isLoading = false),
  ).subscribe();
 

}
}

