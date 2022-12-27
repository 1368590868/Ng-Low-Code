import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { catchError, elementAt, tap } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { UserManagerDialogs } from '../user-manager/user-manager-dialogs.component';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

import { MenuConfigProps } from './nav-menu.type';


@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit  {
  isExpanded = false;
  @ViewChild(UserManagerDialogs) userManagerDialog; 

  user: any; 
  siteInfo: any; 

  menuConfig:MenuConfigProps 

  constructor(
    private uiService: UIService,
    public appDataService: AppDataService,
    public userService: UserService,
    private notificationService: NotificationService
    
  ) {
    this.user = userService.USER; 
    console.log('NavMenuComponent user', this.user); 
    uiService.getEnvironment().subscribe(result => {
      //this.datacorrections = result;
      //Check permissions for result set 
      //If there are any 
      console.log('siteInfo', result); 
      this.siteInfo = result; 
    }, error => console.error(error));

    
    uiService.getSiteVersion().subscribe(result => {
      //this.datacorrections = result;
      this.appDataService.siteVersion = "Site Version " + result.VersionInfo + ", Release Date " + result.DateInfo; 
      console.log('siteVersion', result); 

      //If there are any 
    }, error => console.error(error));

  }

  ngOnInit() { 
    this.uiService.getMenuConfig().pipe(
      catchError(this.handleError('getMenuConfig', {}))
    )
      .subscribe((res: MenuConfigProps) => {
        console.log(res)
        this.menuConfig = res
    })
}
  
private handleError<T>(operation = 'operation', result ?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error, operation); // log to console instead

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}



  public openUserProfile()
  {
      this.userManagerDialog.userProfileInit(); 
  }
}
