import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { AppDataService } from '../services/app-data.service';
import { DataCorrectionDialogs } from '../data-correction/data-correction-dialogs.component';
import { LandBaseDialogs} from '../land-base/land-base-dialogs.component'; 
import { ElectricDialogs} from '../electric/electric-dialogs.component';
import { UndergroundDialogs} from '../underground/underground-dialogs.component';
import { UserService } from '../services/user.service';
import { ConfirmationService } from 'primeng/api';
import { UserManagerComponent } from '../user-manager/user-manager.component';
import { UIService } from '../services/UI.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild(DataCorrectionDialogs) dataCorrectionDialogs;
  @ViewChild(LandBaseDialogs) landbaseDialogs;
  @ViewChild(ElectricDialogs) electricDialogs;
  @ViewChild(UndergroundDialogs) undergrounDialogs;
  @ViewChild(UserManagerComponent) userManager;

  @ViewChild('gasModule') gasSplitter;
  @ViewChild('electricModule') electricplitter;
  @ViewChild('undergroundModule') undergroundSplitter;
  @ViewChild('DCModule') DCSplitter;
  @ViewChild('landbaseModule') landbaseSplitter;
  @ViewChild('FileNetWOModule') fnwoSplitter;

  destroy$ = new Subject();
  routeTool: string;
  user: any;
  searchPanelCollapsed: any;
  searchPanelSizes: any; 

  constructor(
    public appDataService: AppDataService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private uiService: UIService
    
  ) {
    this.user = userService.USER;
    this.searchPanelCollapsed = {}; 
    this.searchPanelSizes = {}; 
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {

    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd),
      tap((event: RouterEvent) => {
        this.appDataService.currentTool = this.routeTool;
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
    });

    
    this.route.queryParams.subscribe(params => {
      console.log('queryParams', params);
    });

    
    this.route.queryParamMap.subscribe(params => {
      console.log('queryParamsMap', params);
    });


    this.route.params.pipe(
      takeUntil(this.destroy$)
      ).subscribe((param: any) => {
      console.log('Route.Param', param); 
       this.openQuickLink(param['action'], param['id']);
    });

    
    this.route.paramMap.subscribe(params => {
      console.log('ParamMap', params);
    });
    

    this.route.data.pipe(
      tap(data => {
        console.log('route.data', data);
        if (data && data.currentTool) {
          this.appDataService.currentTool = data.currentTool;
          this.routeTool = data.currentTool;
        }
        console.log('data.currentTool', data.currentTool);

        // if (!environment.production) {
        //   console.log('RUN_DEBUG - this.appDataService.currentTool = \'DataCorrections\'');
        //   this.appDataService.currentTool = 'DataCorrections';
        // }
      }),
      takeUntil(this.destroy$)
    ).subscribe();


    
  }

  togglePanel(splitterRef, key)
  {     
     if (this.searchPanelCollapsed[key])
     {
      splitterRef._panelSizes = this.searchPanelSizes[key]; 
      this.searchPanelCollapsed[key] = false; 

     }
     else 
    {
      this.searchPanelSizes[key] = splitterRef._panelSizes; 
      splitterRef._panelSizes = [0, 100];
      this.searchPanelCollapsed[key] = true; 
    }     
     splitterRef.saveState();
     splitterRef.restoreState();
  }
  openQuickLink(link: string, id: string )
  {
    console.log('openQuickLink', link); 
    console.log('openQuickID', id); 

    if (link == 'NEWDATACORRECTION' || link?.toUpperCase() == 'NEWDC')
    {

      this.uiService.addSiteVisitLog('HOME', 'Quick Link', link);
      //console.log('this.dataCorrectionDialogs', this.dataCorrectionDialogs);
      setTimeout(() => {
      console.log('dataCorrectionDialogs', this.dataCorrectionDialogs);
      this.dataCorrectionDialogs.addNewInit();   
      }, 0);
    }
    else if (link?.toUpperCase() == 'NEWLANDBASE')
    {
      this.uiService.addSiteVisitLog('HOME', 'Quick Link', link);
      //console.log('this.dataCorrectionDialogs', this.dataCorrectionDialogs);
      setTimeout(() => {
      console.log('landbaseDialogs', this.landbaseDialogs);
      this.landbaseDialogs.ReceivePlatInit();   
      },0);
    }
    else if (link?.toUpperCase() == 'NEWELECTRIC')
    {
      this.uiService.addSiteVisitLog('HOME', 'Quick Link', link);
      //console.log('this.dataCorrectionDialogs', this.dataCorrectionDialogs);
      setTimeout(() => {
      console.log('electric Dialog', this.electricDialogs);
      this.electricDialogs.receiveInit();   
      },0);
    }
    else if (link?.toUpperCase() == 'NEWUNDERGROUND')
    {
      this.uiService.addSiteVisitLog('HOME', 'Quick Link', link);
      //console.log('this.dataCorrectionDialogs', this.dataCorrectionDialogs);
      setTimeout(() => {
      console.log('ug Dialog', this.undergrounDialogs);
      this.undergrounDialogs.receiveInit();   
      },0);
    }
    else if (link?.toUpperCase() == 'GAS')
    {
      console.log('Routing Gas'); 

      setTimeout(() => {
        console.log('gasSplitter', this.gasSplitter); 
        this.appDataService.currentSearchView = 'Detail';         
        this.appDataService.currentTool = 'Gas'; 
        setTimeout(()=>{
          this.togglePanel(this.gasSplitter, 'GAS'); 
        });

      }, 0);
        

    }
    else if (link?.toUpperCase() == 'STAGING')
    {
      console.log('Routing Staging'); 

      setTimeout(() => {
        console.log('fnwoSplitter', this.fnwoSplitter); 
        this.appDataService.currentSearchView = 'Detail';         
        this.appDataService.currentTool = 'FileNetWO'; 
        // setTimeout(()=>{
        //   this.togglePanel(this.fnwoSplitter, 'FileNetWO'); 
        // });

      }, 0);
        

    }
    else if (link?.toUpperCase() == 'ELECTRIC')
    {
      console.log('Routing Gas'); 

      setTimeout(() => {
        console.log('electricSplitter', this.electricplitter); 
        this.appDataService.currentSearchView = 'Detail';         
        this.appDataService.currentTool = 'Electric'; 
        setTimeout(()=>{
          this.togglePanel(this.electricplitter, 'ELECTRIC'); 
        });

      }, 0);
        

    }
    else if (link?.toUpperCase() == 'UNDERGROUND')
    {
      console.log('Routing UNDERGROUND'); 

      setTimeout(() => {
        console.log('undergroundSplitter', this.undergroundSplitter); 
        this.appDataService.currentSearchView = 'Detail';         
        this.appDataService.currentTool = 'Underground'; 
        setTimeout(()=>{
          this.togglePanel(this.undergroundSplitter, 'UNDERGROUND'); 
        });

      }, 0);
        

    }
    else if (link?.toUpperCase() == 'DC')
    {
      console.log('Routing DC'); 

      setTimeout(() => {
        console.log('DCSplitter', this.DCSplitter); 
        this.appDataService.currentSearchView = 'Detail';         
        this.appDataService.currentTool = 'DC'; 
        setTimeout(()=>{
          this.togglePanel(this.DCSplitter, 'DC'); 
        });

      }, 0);
        

    }
    else if (link?.toUpperCase() == 'LANDBASE')
    {
      console.log('Routing LANDBASE'); 

      setTimeout(() => {
        console.log('landbaseSplitter', this.landbaseSplitter); 
        this.appDataService.currentSearchView = 'Detail';         
        this.appDataService.currentTool = 'Landbase'; 
        setTimeout(()=>{
          this.togglePanel(this.landbaseSplitter, 'LANDBASE'); 
        });

      }, 0);
        

    }
    else if (link?.toUpperCase() == 'REPORT')
    {
      console.log('Routing REPORT'); 

      setTimeout(() => {
        //console.log('gasSplitter', this.gasSplitter); 
        this.appDataService.currentSearchView = 'Multiple';         
        this.appDataService.currentTool = 'Reports'; 
        

      }, 0);
        

    }
  }
}
