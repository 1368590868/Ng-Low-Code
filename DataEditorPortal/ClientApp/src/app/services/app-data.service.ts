import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppDataService {
  public currentTool = 'NONE';
  public searchClicked$ = new Subject<any>();
  public searchViewChanged$ = new Subject<any>(); 
  
  public currentSearchView = 'Detail'; 
  public currentSearchResult : SearchDetailResult[]; 
  public currentSearchNoMatch: boolean = false; 
  public currentNavigationView = ''; 
  public currentNavigationItem : any; 
  public currentNavigationType = ''; 
  public siteVersion: string; 
  public currentModule = ''; 
  //Used during the receive order to refresh the page with a new ID
  public currentSearchTransferToOrderNumber: string; 


  constructor(private router:Router) { }

  activateTool(tool: string) {
    this.currentTool = tool;
    this.router.navigateByUrl('/setting/' + tool);
    console.log('currentTool', this.currentTool);
  }

 
}

export interface SearchDetailResult {
  Label: string,
  Status: string, 
  StatusDescription: string,
  ID: string,
  Index: number 
}
