import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmationService } from 'primeng/api';
import { catchError, tap } from 'rxjs/operators';
import { ArrayDestructuringAssignment } from 'typescript';
import { AppDataService } from '../services/app-data.service';
import { NotificationService } from '../services/notification.service';
import { UIService } from '../services/UI.service';
import { UserService } from '../services/user.service';
import {AccordionModule} from 'primeng/accordion';
import { Guid } from "guid-typescript";
@Component({
  selector: 'app-user-manager-dialogs',
  templateUrl: './user-manager-dialogs.component.html',
  styleUrls: ['./user-manager.component.css']
})
export class UserManagerDialogs implements OnInit {

  constructor(private userService: UserService,
    private notificationService: NotificationService,
    private uiService: UIService,
    public appDataService: AppDataService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService
) { 

    this.user = userService.USER; 
}

@Output() refreshGrid = new EventEmitter<string>();


  ngOnInit(): void {
  }
  user: any; 
  showWindow = {};
  userData: UserDataModel;
  roleData: RoleDataModel; 
  validationErrors: any; 
  
  public activateWindow(key: string) {
    this.showWindow = {};
    if (key) {
      this.showWindow[key] = true;
    }

  }

  public closeWindow(event: any) {
    console.log('event', event);
    this.showWindow = {};
  }

  public updateGrid() {
    this.refreshGrid.emit();
  }

  public ManageRoleInit()
  {
      this.roleData = new RoleDataModel(); 
      
          //Get vendors 
    this.uiService.getLookups('Roles').pipe(
      tap(result => {
        this.roleData.LK_Roles = result || [];
        
        //Add New Role 
        let newRoleLabel = {
            Value : "<NEW>",
            Label : "<New Role>"
        }; 
        this.roleData.LK_Roles.push(newRoleLabel); 

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();  


      this.showWindow['MANAGEROLES'] = true; 
  }

  public manageRoleSubmit()
  {
    this.validationErrors = {}; 
    if (!this.roleData.SelectedRole)
    {

    }
    
    if (this.roleData.SelectedRole.Value == "<NEW>")
    {
      console.log('roleData', this.roleData); 

      this.userService.addNewRole(this.roleData).pipe(
        tap(result => {
          if (result.errormessage) {
            //Notify message
            this.notificationService.notifyError("Add Failed", result.errormessage);
          }
          else {
            //update permissions and roles 
            this.notificationService.notifySuccess("Role has been successfully added", "");
            this.ManageRoleInit(); 
        }          
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
  
      }
      else 
      {
        console.log('roleData', this.roleData); 

        this.userService.updateRole(this.roleData).pipe(
          tap(result => {
            if (result.errormessage) {
              //Notify message
              this.notificationService.notifyError("Update Failed", result.errormessage);
            }
            else {
              //update permissions and roles 
              this.notificationService.notifySuccess("Role has been successfully updated", "");
              this.ManageRoleInit(); 
            }          
          }),
          catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
        ).subscribe();
  
      }
  }
  public ManageRoleRetrieve()
  {
    this.roleData.RoleID = this.roleData.SelectedRole.Value; 

    if (this.roleData.SelectedRole.Value == "<NEW>")
    {
      this.roleData.RoleName = "";
      this.roleData.RoleDescription = "";
    }
    else 
    {
      this.roleData.RoleName = this.roleData.SelectedRole.Label;   
      this.roleData.RoleDescription = this.roleData.SelectedRole.Value2; 
    }

    this.userService.fetchRolePermissionData(this.roleData.RoleID).pipe(
      tap(result => {
        this.roleData.LK_Permissions = result.Data; 
        this.roleData.LK_Permissions.forEach(e => {
          if (e.ROLEGRANTED == '1')
          {
            e.Selected = true; 
          }
          else 
          {
            e.Selected = false; 
          }
          return e; 
        });
        this.roleData.Permissions = this.arrangePermissions(this.roleData.LK_Permissions); 
        console.log(this.roleData.Permissions);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }
  public AddNewInit()
  {
    this.userData = new UserDataModel(); 
    this.userData.Mode = 'Add'; 
    this.userData.UserID = ''; 

    //Get vendors 
    this.uiService.getLookups('Vendor').pipe(
      tap(result => {
        this.userData.LK_Vendor = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();  

    this.uiService.getLookups('Employer').pipe(
      tap(result => {
        this.userData.LK_Employer = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();  
    
    this.userData.Groups = []; 
    this.userData.Roles = []; 
    this.showWindow['EDIT'] = true;

  }
  public editInit(data)
  {

    this.userData = new UserDataModel(); 


      //Get vendors 
      this.uiService.getLookups('Vendor').pipe(
        tap(result => {
          this.userData.LK_Vendor = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();  

      this.uiService.getLookups('Employer').pipe(
        tap(result => {
          this.userData.LK_Employer = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();  


    this.userData.Mode = 'Edit'; 
    this.userData.Email = data['EMAIL'];     
    this.userData.DisplayName = data['NAME']; 
    this.userData.Phone = data['PHONE']; 
    this.userData.Notify = data['AUTO_EMAIL'] == '1'; 
    this.userData.Vendor = data['VENDOR']; 
    this.userData.Status = data['COMMENTS']; 
    this.userData.Employer = data['EMPLOYER']; 
    this.userData.DivisionList = data['DIVISION']; 
    this.userData.Division = data['DIVISION'].split(' '); 
    this.userData.UserID = data['USERID']; 

    this.fetchPermissions();

    this.showWindow["EDIT"] = true; 

  }

  public editSubmit()
  {


    console.log('submit', this.userData); 
    this.validationErrors = {}; 
    
    if (!this.userData.UserID)
    {
      this.validationErrors.UserID = "A CNP ID is required."; 
    }

    if (!this.userData.Email)
    {
      this.validationErrors.Email = "An Email is required."; 
    }

    if (!this.userData.DisplayName)
    {
      this.validationErrors.DisplayName = "A Display Name is required."; 
    }

    if (Object.keys(this.validationErrors).length) {
      console.log('has error');
      return;
    }


    if (this.userData.Notify)
    {
      this.userData.AutoEmail = "1"; 
    }
    else 
    {
      this.userData.AutoEmail = "0";
    }

    if (this.userData.Division.length > 0)
    {
      this.userData.DivisionList = this.userData.Division.join(' '); 
    }
    if(this.userData.Mode == 'Add')
    {

      this.userService.addNew(this.userData).pipe(
        tap(result => {
          console.log('result', result);
          if (result.errormessage) {
            //Notify message
            this.notificationService.notifyError("Add Failed", result.errormessage);
          }
          else {
            //update permissions and roles 
            

            this.notificationService.notifySuccess("Add has been successfully completed", "");
            this.showWindow = {}; 
              this.updateGrid(); 
          }
        }
        ),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
      }
    else 

    {
      this.userService.saveData(this.userData).pipe(
        tap(result => {
          console.log('result', result);
          if (result.errormessage) {
            //Notify message
            this.notificationService.notifyError("Save Failed", result.errormessage);
          }
          else {
            this.notificationService.notifySuccess("Edit Completed Successfully", "");
            this.showWindow = {}; 
            if (this.userData.Mode == 'Profile')
            {
              this.userService.login().subscribe();             
            }
            else 
            {
              this.updateGrid(); 
            }
          }
        }
        ),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();
        
    }
  }


  
  public userProfileSubmit()
  {
    if (this.userData.Notify)
    {
      this.userData.AutoEmail = "1"; 
    }
    else 
    {
      this.userData.AutoEmail = "0";
    }
    this.userService.saveData(this.userData).pipe(
      tap(result => {
        console.log('result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Save Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Your profile has been successfully updated", "");
          this.userService.login().subscribe(); 
          this.showWindow = {}; 

        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public editRole()
  {
    if (this.userData.Mode == 'Add')
    {
      if (!this.userData.UserID)
      {
        this.validationErrors = {}; 
        this.validationErrors.UserID = "A CNP ID is required."; 
        this.validationErrors.Roles = "A CNP ID must be supplied before any Roles or Permissions may be added"; 
        return; 
      }
      //Check to make sure they have a CNP ID supplied 
    }

    this.uiService.getLookups('UserRoles',this.userData.UserID).pipe(
      tap(result => {
        this.userData.LK_Roles = result || [];
        this.userData.LK_Roles.forEach(e => {
          if (e.Value2 == '1')
          {
            e.Selected = true; 
          }
          else 
          {
            e.Selected = false; 
          }
          return e; 
        });
                this.showWindow['ROLES'] = true; 
        console.log(this.userData.LK_Roles);
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();

  }

  
  public saveRoles()
  {

    this.userService.saveRoles(this.userData).pipe(
      tap(result => {
        console.log('result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Save Failed", result.errormessage);
        }
        else {

          if (this.userData.Mode == 'Profile')
          {
            //this.userService.login().subscribe(); 
            location.reload(); 
          }
          else  
          {
            this.notificationService.notifySuccess("Your roles has been successfully updated", "");
            this.showWindow['ROLES'] = false; ; 
  
            this.fetchPermissions();
  //            this.updateGrid(); 
          }
          

        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public editPermission()
  {

    if (this.userData.Mode == 'Add')
    {
      if (!this.userData.UserID)
      {
        this.validationErrors = {}; 
        this.validationErrors.Permissions = "A CNP ID must be supplied before any Roles or Permissions may be added"; 
        return; 
      }
      //Check to make sure they have a CNP ID supplied 
    }

    console.log('editPermission', this.userData.UserID); 
    this.userService.fetchSitePermissionData(this.userData.UserID).pipe(
      tap(result => {
        this.userData.LK_Permissions = result.Data || [];
        this.userData.LK_Permissions.forEach(e => {
          if (e.USERGRANTED == '1')
          {
            e.Selected = true; 
          }
          else 
          {
            e.Selected = false; 
          }
          return e; 
        });
        this.userData.Permissions = this.arrangePermissions(this.userData.LK_Permissions); 
        this.showWindow['PERMISSIONS'] = true; 
        console.log('permissions', this.userData.Permissions);

      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public arrangePermissions(permissions: any[])
  {
     var grouprecords = []; 
          permissions.forEach(
            f => {
                var match = grouprecords.filter(x=>x.CATEGORY == f.CATEGORY)[0];
                if (match)
                {
                    match.Data.push(f);
                }
                else 
                {
                  var newGroup = {
                    CATEGORY: f.CATEGORY, 
                    Data: []
                }; 
                  newGroup.Data.push(f); 
                  grouprecords.push(newGroup);
                }
            }
          ); 
          return grouprecords; 
  }
  public savePermissions()
  {
 
    console.log('userData Save Permission', this.userData); 
    this.userService.savePermissions(this.userData).pipe(
      tap(result => {
        console.log('result', result);
        if (result.errormessage) {
          //Notify message
          this.notificationService.notifyError("Save Failed", result.errormessage);
        }
        else {
          this.notificationService.notifySuccess("Your permissions has been updated", "");
          if (this.userData.Mode == 'Profile')
          {
            //this.userService.login().subscribe(); 
            console.log('reload'); 
            location.reload(); 
          }
          else  
          {
            this.updateGrid(); 
          }
          
          this.fetchPermissions();

          this.showWindow['PERMISSIONS'] = false; 

        }
      }
      ),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();
  }

  public fetchPermissions()
  {
    
  this.userService.fetchPermissionData(this.userData.UserID).pipe(
    tap(result => {

      console.log('result', result);

      var data = result['Data'] || []; 
      this.userData.Groups = []; 
      this.userData.Roles = []; 

      data.forEach(e => {
        if (e['TYPE'] == 'G')
        {
          var Group = {
            Name : e['PERMISSIONNAME'],
            Description : e['DESCRIPTION']
          }; 

          this.userData.Groups.push(Group)
        }
        else 
        {
          var item = {
            Name : e['PERMISSIONNAME'],
            Description : e['DESCRIPTION']
          }; 


          this.userData.Roles.push(item); 

        }
      });
      

      console.log('userData', this.userData);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();
  }

  public validateUser()
  {
    
  this.userService.fetchUserData(this.userData.UserID).pipe(
    tap(result => {

      if  (result.Total > 0)
      {
        this.validationErrors = {};
        this.validationErrors.UserID = "The CNP ID already exist. "; 
      }
      else 
      {
        this.validationErrors = {};
      }

    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();

  }
  public userProfileInit()
  {
            //Get all necessary Lookups
            console.log('user', this.user); 

              this.userData = new UserDataModel(); 

  this.userService.fetchUserData(this.userService.USER.Username).pipe(
    tap(result => {

      console.log('result', result);

      var data = result['Data'][0]; 
      this.userData.Mode = 'Profile'; 
      this.userData.Email = data['EMAIL']; 
      this.userData.DisplayName = data['NAME']; 
      this.userData.Phone = data['PHONE']; 
      this.userData.Notify = data['AUTO_EMAIL'] == '1'; 
      this.userData.Vendor = data['VENDOR']; 
      this.userData.Status = data['COMMENTS']; 
      this.userData.Employer = data['EMPLOYER'];
      this.userData.UserID = data['USERID']; 
      
      this.userData.DivisionList = data['DIVISION']; 
      this.userData.Division = data['DIVISION'].split(' '); 
  
      
      this.fetchPermissions();

      //Get vendors 
      this.uiService.getLookups('Vendor').pipe(
        tap(result => {
          this.userData.LK_Vendor = result || [];
        }),
        catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
      ).subscribe();  

            //Get vendors 
            this.uiService.getLookups('Employer').pipe(
              tap(result => {
                this.userData.LK_Employer = result || [];
              }),
              catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
            ).subscribe();  

            
      this.showWindow['EDIT'] = true; 
      console.log('userData', this.userData);
    }),
    catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
  ).subscribe();



    //this.userManager.userProfileInit(); 
  }

}

export class RoleDataModel
{

  LK_Roles: any[]; 
  LK_Permissions: any[]; 
  SelectedRole: any; 
  RoleName: string; 
  RoleDescription: string; 
  RoleID : string; 
  Permissions: any[]; 
}

export class UserDataModel 
{
  Mode: string; //Profile / Edit
  LK_Vendor: any[]; 
  LK_Employer: any[]; 
  LK_Permissions: any[]; 
  LK_Roles: any[]; 

  UserID: string; 
  DisplayName: string; 
  Email: string; 
  Phone: string; 
  Notify: boolean;   
  Vendor: string;
  Status: string; 
  Employer: string; 
  Division: string[] = []; 
  DivisionList: string; 
  AutoEmail: string; 

  Permissions: any[]; 

  Groups: any[]; 
  Roles: any[]; 
}
