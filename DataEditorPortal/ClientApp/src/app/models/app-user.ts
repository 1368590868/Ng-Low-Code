export class AppUser {
    IdentityName: string;
    Username: string;
    Domain: string;
    DisplayName: string;
    Email: string;
    Vendor: string;
    Authenticated: boolean;
    Permissions: UserPermissions;


}

export class UserPermissions
{
    DC_SUBMIT_NEW: boolean; 
    DC_VIEW_VENDOR_ONLY : boolean; 
    DC_VIEW_ALL : boolean;
    DC_EDIT_BASIC : boolean;
    DC_EDIT_ALL: boolean; 
    DC_ASSIGN_ANY : boolean;
    DC_ASSIGN_VENDOR_ONLY  : boolean;
    DC_SET_STATUS: boolean; 
    DC_EDIT_VENDOR_ONLY: boolean;
    USER_ADMIN: boolean; 

    LANDBASE_VIEW_VENDOR_ONLY : boolean; 
    LANDBASE_VIEW_ALL: boolean; 
    LANDBASE_VIEW_ADVANCED: boolean; 
    LANDBASE_EDIT_BASIC: boolean; 
    LANDBASE_EDIT_ALL: boolean; 

    LANDBASE_EDIT_VENDOR_ONLY: boolean;
    LANDBASE_SUBMIT_NEW: boolean; 
    LANDBASE_DELETE: boolean; 
    LANDBASE_ASSIGN_ANY: boolean; 
    LANDBASE_ASSIGN_VENDOR_ONLY: boolean ;
    LANDBASE_ASSIGN_SELF: boolean; 
    LANDBASE_COMPLETE: boolean; 
    LANDBASE_PROBLEM: boolean; 
    LANDBASE_CLOSED_PROBLEM: boolean; 
    LANDBASE_CNFA: boolean; 
    LANDBASE_SENTBACK: boolean; 
    LANDBASE_GETBACK: boolean; 
    LANDBASE_REOPEN: boolean; 
    LANDBASE_POSTABLE: boolean;
    LANDBASE_FIXED: boolean;
    LANDBASE_EDIT_PACKET: boolean; 
    LANDBASE_ASSIGN_PROJECT : boolean; 


    GAS_EDIT_VENDOR_ONLY: boolean;
    GAS_VIEW_VENDOR_ONLY : boolean; 
    GAS_VIEW_ALL: boolean; 
    GAS_VIEW_ADVANCED: boolean; 
    GAS_EDIT_BASIC: boolean; 
    GAS_EDIT_ALL: boolean; 
    GAS_SUBMIT_NEW: boolean; 
    GAS_DELETE: boolean; 
    GAS_ASSIGN_ANY: boolean; 
    GAS_ASSIGN_VENDOR_ONLY: boolean ;
    GAS_ASSIGN_SELF: boolean; 
    GAS_COMPLETE: boolean; 
    GAS_PROBLEM: boolean; 
    GAS_CLOSED_PROBLEM: boolean; 
    GAS_CNFA: boolean; 
    GAS_SENTBACK: boolean; 
    GAS_GETBACK: boolean; 
    GAS_REOPEN: boolean; 
    GAS_POSTABLE: boolean;
    GAS_FIXED: boolean;
    GAS_EDIT_PACKET: boolean; 
    GAS_ASSIGN_PROJECT : boolean; 



    

    ELECTRIC_EDIT_VENDOR_ONLY: boolean;
    ELECTRIC_VIEW_VENDOR_ONLY : boolean; 
    ELECTRIC_VIEW_ALL: boolean; 
    ELECTRIC_VIEW_ADVANCED: boolean; 
    ELECTRIC_EDIT_BASIC: boolean; 
    ELECTRIC_EDIT_ALL: boolean; 
    ELECTRIC_SUBMIT_NEW: boolean; 
    ELECTRIC_DELETE: boolean; 
    ELECTRIC_ASSIGN_ANY: boolean; 
    ELECTRIC_ASSIGN_VENDOR_ONLY: boolean ;
    ELECTRIC_ASSIGN_SELF: boolean; 
    ELECTRIC_COMPLETE: boolean; 
    ELECTRIC_PROBLEM: boolean; 
    ELECTRIC_CLOSED_PROBLEM: boolean; 
    ELECTRIC_CNFA: boolean; 
    ELECTRIC_SENTBACK: boolean; 
    ELECTRIC_GETBACK: boolean; 
    ELECTRIC_REOPEN: boolean; 
    ELECTRIC_POSTABLE: boolean;
    ELECTRIC_FIXED: boolean;
    ELECTRIC_EDIT_PACKET: boolean; 
    ELECTRIC_ASSIGN_PROJECT : boolean; 

}