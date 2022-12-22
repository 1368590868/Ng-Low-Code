import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppDataService } from '../services/app-data.service';
import { catchError, elementAt, tap } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { ActivatedRoute,  NavigationEnd, Router, RouterEvent, UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { UIService } from '../services/UI.service';
import {TreeNode} from 'primeng/api';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { HighlightSpanKind } from 'typescript';
import { stringify } from 'querystring';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})


export class SearchComponent implements OnInit {
  @Input() SearchConfig;
  @Input() DualSearchView: boolean = false;
  @Input() SearchView: string;
  @Input() NavigationView: boolean = false;

  cities: DropDownData[];
  selectedCity: string;
  searchParams: any[];
  navParams: TreeNode[];
  navItem: any; 
  isRunning: boolean; 
  showSavedSearch: boolean; 
  saveSearchData: SaveSearchModel; 
  saveSearchDataAdd: SaveSearchModel; 
  user: any;

  constructor(
    public searchService: UIService,
    public appDataService: AppDataService,
    public userService: UserService,
    private notificationService: NotificationService,
    public confirmationService: ConfirmationService,
    private route: ActivatedRoute
    
  ) {
    this.user = userService.USER;

  }

  getDropdownOptions(config: any) {
    this.searchService.getSearchDropdowns(config).subscribe(result => {
      //this.datacorrections = result;
      console.log('result', result);
      config.Options = result;
      if (config.Type == 'pMultiSelect')
      {
        //Remove first element
        config.Options.shift(); 
      }
    }, error => console.error(error));
  };

  checkCascade(param: any)
  {
    console.log('checkCascade', param);
    if (param.CascadeFilterConfig?.length > 0)
    {
      console.log('in cascade');
      //Add to the cascadefilter value for the destination inputs 
      for (let i = 0; i < param.CascadeFilterConfig.length; i++)
      {
        var config = param.CascadeFilterConfig[i];
        config.SelectedValue = param.SelectedValue;
        var searchParam = this.searchParams.filter(f=>f.Name == config.InputName)[0];

        var bAdd = true; 
        for (let j = 0; j < searchParam.CascadeFilterValue.length; j++)
        {
          var c = searchParam.CascadeFilterValue[j];
        if (c.InputName == config.InputName && c.SourceName == config.SourceName)
        {  
              //If the value is null, remove it               
              if (config.SelectedValue && config.SelectedValue != '...')
              {
                c.SelectedValue = config.SelectedValue; 
                searchParam.SelectedValue = null; 
              }
              else 
              {
                searchParam.CascadeFilterValue.splice(j, 1);
              }
              bAdd = false;               
              break; 
        }
        }
        if (bAdd)
        {
          if (config.SelectedValue && config.SelectedValue != '...')
              {
                config.SourceName = param.Name; 
                searchParam.CascadeFilterValue.push(config); 
                searchParam.SelectedValue = null; 
              }
        }

        console.log('cascadeFilter', searchParam); 
        this.getDropdownOptions(searchParam);   
      
      }
    }
  }
  searchSubmit(): void {
    console.log('Search Submitted', this.searchParams);
    //Anything with ..., remove 
    for (let i = 0; i < this.searchParams.length; i++)
    {
        if (this.searchParams[i].SelectedValue && this.searchParams[i].SelectedValue == '...')
        {
          this.searchParams[i].SelectedValue = null; 
        }

        if (this.searchParams[i].ToggleValue)
        {
          this.searchParams[i].ToggleValue = "True"; 
        }
        else 
        {
          this.searchParams[i].ToggleValue = ""; 
        }
    }
    this.appDataService.searchClicked$.next(this.searchParams);

  }

  getSelectedItems(param: any) {
    console.log('m select', param); 
    
    param.SelectedValue = param.SelectedValueList.join(',');    

  }
  selectNavItem()
  {
    //console.log('selected node', event.node); 
    console.log('selected node 2', this.navItem); 
    if (this.navItem.type == 'report' || this.navItem.type == 'search')
    {

    
      this.isRunning = true; 
      this.changeView('Multiple'); 
      this.searchService.getReportParameters(this.navItem.key,this.SearchConfig).subscribe(result => {
      //this.datacorrections = result;
      console.log('result', result); 
      this.searchParams = result['Search'] as any[];
      this.appDataService.currentSearchView = 'Multiple'; 
      this.appDataService.currentNavigationView = this.SearchConfig; 
      //Find root node
      var parent = this.navItem.parent; 
      
      while (parent != undefined)
      {
        this.navItem.grouplabel =  parent.label; 

        parent = parent.parent; 
        
      }

      this.appDataService.currentNavigationItem = this.navItem; 
      console.log('searchParam', this.searchParams);
      console.log('this.appDataService.currentSearchView', this.appDataService.currentSearchView);

      
      this.showSavedSearch = false; 
      this.saveSearchData = new SaveSearchModel(); 
      this.fetchSavedSearches(this.SearchConfig + ":" + this.appDataService.currentNavigationItem.key);

      for (let i = 0; i < this.searchParams.length; i++) {
        if (this.searchParams[i].OptionType == 'SQL') {
          console.log('getting dropdowns');
          this.searchParams[i].Options = this.getDropdownOptions(this.searchParams[i]);
        }
        else if (this.searchParams[i].OptionType == 'Options') {
          //The options is already populated
        }
      }

      //Populate Search Items 
      if ( this.navItem.type == 'search')
      {
         var searchData = JSON.parse(this.navItem.Data); 

            
        for (let i = 0; i < this.searchParams.length; i++) {
          var match = searchData.filter(x => x.Name == this.searchParams[i].Name)[0];
          if (match)
          {
            this.searchParams[i].SelectedValue = match.SelectedValue; 
            this.searchParams[i].SelectedValueList = match.SelectedValueList; 
            this.checkCascade(this.searchParams[i]); 
          }
          else  
          {
            console.log('Not Found ' + this.searchParams[i].Name); 
          }
        
        }

        this.searchSubmit(); 
         console.log(searchData); 
      }
      this.isRunning = false; 
      //If there are any 
    }, error => console.error(error));
  }
  }

  openNavigation()
  {
    this.appDataService.currentSearchView = 'Navigation';
  }

  searchLink(idx: number): void {
    //just pull in the CachedIndex 
    let newSearchParam = {};
    newSearchParam['CachedIndex'] = idx;
    console.log('searchLink', newSearchParam);
    this.appDataService.searchClicked$.next(newSearchParam);
  }

  changeView(view: any) {
    console.log('changeView', this.appDataService.currentSearchView);
    this.appDataService.currentSearchView = view;
    this.appDataService.currentSearchResult = [];
    this.appDataService.searchViewChanged$.next();

  }
  clearSearch()
  {
    this.searchParams.forEach(f=>{
        f.SelectedValue = null; 
        f.SelectedValueList = []; 
        f.CascadeFilterValue = []; 
        if (f.OptionType == 'SQL') {
          console.log('getting dropdowns');
          f.Options = this.getDropdownOptions(f);
        }
       
        
    });
  }
  ngOnInit(): void {
    this.isRunning = true; 
    console.log('this is the config im using to populate the form', this.SearchConfig);

    console.log('searchconfig', this.SearchConfig);

    //Reset appDataService 
    this.appDataService.currentSearchResult = [];
    this.appDataService.currentNavigationItem = null; 
    this.appDataService.currentNavigationView = ''; 
    this.appDataService.currentSearchNoMatch = false; 


    this.route.params.subscribe((param: any) => {
      console.log('Param', param['id']); 
     
      if (param['action'] == 'REPORT' && param['id'])
      {

        //retreive search config         
        this.searchService.getReportParameters(param['id'],'Report').subscribe(result => {
      //this.datacorrections = result;
      //Find Report Config 
      //Build Key 
      this.navItem = {
         key : param['id'],
         label : result['Label'],    
         type: 'report'     
      }
      ;
      console.log('getReportParameters', result); 
      this.searchParams = result['Search'] as any[];
      this.appDataService.currentSearchView = 'Multiple'; 
      this.appDataService.currentNavigationView = 'Report'; 
      //this.appDataService.currentNavigationItem = this.navItem; 
      this.appDataService.currentNavigationItem = this.navItem; 
      
      console.log('searchParam', this.searchParams);
      console.log('this.appDataService.currentSearchView', this.appDataService.currentSearchView);

        
      this.showSavedSearch = false; 
      this.saveSearchData = new SaveSearchModel(); 
//      this.fetchSavedSearches(this.SearchConfig + ":" + this.appDataService.currentNavigationItem.key);


      for (let i = 0; i < this.searchParams.length; i++) {
        if (this.searchParams[i].OptionType == 'SQL') {
          console.log('getting dropdowns');
          this.searchParams[i].Options = this.getDropdownOptions(this.searchParams[i]);
        }
        else if (this.searchParams[i].OptionType == 'Options') {
          //The options is already populated
        }
      }

        this.route.queryParams.subscribe(qparams => {
          console.log('queryParamsMap', qparams);
          if (qparams.SAVEDSEARCH)
          { 
              //Find Search Nav Item 

              this.saveSearchData.ConfigName = 'Report:' + this.navItem.key; 
    
              //Get list of Search Names
              this.searchService.getSavedSearches(this.saveSearchData.ConfigName).pipe(
                tap(result => {
                  this.saveSearchData.LK_SearchNames = result.Data || [];
          
                  //Add Empty Item 
                  var blank = {
                    NAME: '...',
                    ID: ''
                  };
                  this.saveSearchData.LK_SearchNames.unshift(blank); 

          
                  console.log('Query Saved Search',  this.saveSearchData.LK_SearchNames); 
                  var searchItem = this.saveSearchData.LK_SearchNames.filter(f=>f.NAME == qparams.SAVEDSEARCH && f.CONFIGNAME == 'Report:'+ this.navItem.key )[0]; 
                  if (searchItem)
                  {
                    console.log('running saved search', searchItem); 
                    var searchData = JSON.parse(searchItem.SEARCHPARAM); 
    
                      
                    for (let i = 0; i < this.searchParams.length; i++) {
                      var match = searchData.filter(x => x.Name == this.searchParams[i].Name)[0];
                      if (match)
                      {
                        this.searchParams[i].SelectedValue = match.SelectedValue; 
                        this.searchParams[i].SelectedValueList = match.SelectedValueList; 
                        this.checkCascade(this.searchParams[i]); 
                      }
                      else  
                      {
                        console.log('Not Found ' + this.searchParams[i].Name); 
                      }
                    
                    }
                    this.searchSubmit(); 

                  }
                  else 
                  {
                      //Can't find search name    
                      this.notificationService.notifyError("Report Failed", 'Saved Search Name '+ qparams.SAVEDSEARCH + ' does not exist');

                  }
                      console.log('saved Searched', this.saveSearchData.LK_SearchNames); 
                }),
                catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
              ).subscribe(); 
          }
          else 
          {
            this.fetchSavedSearches(this.SearchConfig + ":" + this.appDataService.currentNavigationItem.key);
            Object.keys(qparams).forEach(q => 
              {
                  //Lok for search key 
                  var searchItem = this.searchParams.filter(f=>f.Name == q)[0]; 
                  if (searchItem)
                  {
                      //Add in selected value 
                      console.log('Found'); 
                      searchItem.SelectedValue = qparams[q];
                      if (searchItem.Type == 'pMultiSelect')
                      {
                        searchItem.SelectedValueList = qparams[q].split(',');
                      }
                    }
              }
  
              );

              console.log('modofied search', this.searchParams); 
              this.searchSubmit(); 
  
          }
    
          
          });
      
      //If there are any 
    }, error => console.error(error));

       
      
    }
  });

    if (this.NavigationView) {
      console.log('navigation view'); 
      this.appDataService.currentSearchView = 'Navigation'; 

      //Add Search Node 

      this.searchService.getNavigation(this.SearchConfig).subscribe(result => {
        //this.datacorrections = result;
        //Check permissions for result set 
        this.setPermissions(result as any[]);
        this.cleanUpHeader(result as any[]);        
        this.navParams = result as TreeNode[];
        console.log('navParams', this.navParams);
        this.isRunning = false; 

        //If there are any 

        //Run Saved Search Navigation 
        var searchnode = {
          Description: "",
          Expanded: false,
          Permission: null,
          children: [],
          key: "SAVED_SEARCH",
          label: "Saved Reports",
          type: "Section"

        }; 

        this.navParams.unshift(searchnode); 


        //Get list of Search Names
          this.searchService.getSavedSearchesNav(this.SearchConfig).pipe(
            tap(s => {


              var sData = s.Data || [];
              console.log('sData', sData); 
              for (let index = 0; index < sData.length; index++) {
                const element = sData[index];
                var name = element.CONFIGNAME; 

                var navItem = {
                  Description: null,
                  Expanded: false,
                  Permission: null,
                  children: null,
                  key: name.substring(7),
                  label: element.NAME,
                  type: "search",
                  Data: element.SEARCHPARAM
                };
                searchnode.children.push(navItem); 
              }


              
            }),
            catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
          ).subscribe(); 

      }, error => console.error(error));
    }
    else {
      console.log('search view'); 

      if (this.SearchView) {
        this.appDataService.currentSearchView = this.SearchView;
      }
      if (!this.appDataService.currentSearchView) {
        if (this.DualSearchView) {
          this.appDataService.currentSearchView = 'Detail';
        }
        else {
          this.appDataService.currentSearchView = 'Multiple';
        }
      }

      this.searchService.getSearchParameters(this.SearchConfig, this.appDataService.currentSearchView).subscribe(result => {
        //this.datacorrections = result;
        this.searchParams = result as any[];
        console.log('searchParam', this.searchParams);
        console.log('this.appDataService.currentSearchView', this.appDataService.currentSearchView);
        for (let i = 0; i < this.searchParams.length; i++) {
          if (this.searchParams[i].OptionType == 'SQL') {
            console.log('getting dropdowns');
            this.searchParams[i].Options = this.getDropdownOptions(this.searchParams[i]);
          }
          else if (this.searchParams[i].OptionType == 'Options') {
            //The options is already populated
          }
        }
        this.isRunning = false; 
        
        this.showSavedSearch = false; 
        this.saveSearchData = new SaveSearchModel(); 
        if (this.appDataService.currentSearchView == 'Multiple')
        {
          this.fetchSavedSearches(this.SearchConfig);
        } 


        //Hook into Staging Search Values 
        this.route.params.subscribe((param: any) => {
          console.log('STAGING CHECK', param['action']); 
          if (param['action'] == 'STAGING')
          { 
            //Get Local Storage Search Item 
            var stagingSearchData = JSON.parse(localStorage.getItem("Staging-Data")); 
            
            //Add WOTS Status - REMOVED THIS CRITERIA per Chris
            // var match = this.searchParams.filter(x => x.Name == 'WOTSSTATUS')[0];
            // if (match)
            // {
            //   match.SelectedValue = 'WOTS HOLD';               
            // }

            //Add WorkType
            var stagingSearchWT = stagingSearchData.filter(x=> x.Name == 'WORKTYPE')[0];
            console.log('stagingSearchWO', stagingSearchWT); 
            
            var match = this.searchParams.filter(x => x.Name == 'WORKTYPE')[0];
            if (match)
            {
              match.SelectedValue = stagingSearchWT.SelectedValue;              
            }

            var stagingSearchWO = stagingSearchData.filter(x=> x.Name == 'ORDERNUMBER')[0];
            console.log('stagingSearchWO', stagingSearchWO); 

            var match = this.searchParams.filter(x => x.Name == 'ORDERNUMBER')[0];
            if (match)
            {
              match.SelectedValue = stagingSearchWO.SelectedValue;                          
            }

            this.searchSubmit(); 
          }
        });
      }, error => console.error(error));

    }
  }

  fetchSavedSearches(key: string)
  {
    console.log('fetch SavedSearch', key); 
    this.saveSearchData.ConfigName = key; 
    
    //Get list of Search Names
    this.searchService.getSavedSearches(this.saveSearchData.ConfigName).pipe(
      tap(result => {
        this.saveSearchData.LK_SearchNames = result.Data || [];

        //Add Empty Item 
        var blank = {
          NAME: '...',
          ID: ''
        };
        this.saveSearchData.LK_SearchNames.unshift(blank); 
        console.log('saved Searched', this.saveSearchData.LK_SearchNames); 
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe(); 
  }
  setPermissions(result: any[])
  {
    let index = result.length - 1;

    while (index >= 0) {
      
      if (result[index].type == 'report' && result[index].Permission && !this.user.Permissions[result[index].Permission]) {
        result.splice(index, 1);
      }
      else if (result[index].children?.length > 0)
      {
        this.setPermissions (result[index].children);       
      }
      
      index -= 1;
    } 

    

  }

  cleanUpHeader(result: any[])
  {
    let index = result.length - 1;

    while (index >= 0) {
      if (result[index].type != 'report' && !result[index].children?.length) {
        result.splice(index, 1);
      }
      else if (result[index].children?.length > 0)
      {
        this.cleanUpHeader (result[index].children);       
        if (result[index].type != 'report' && !result[index].children?.length) {
          result.splice(index, 1);
        }
      }
      
      index -= 1;
    } 

  }

  selectSearch()
  {
    //Get Item 
    console.log('selected search', this.saveSearchData.SelectedItem); 

    var searchConfigs =JSON.parse(this.saveSearchData.SelectedItem.SEARCHPARAM); 

    //Append selection to item 
    console.log('searchConfigs', searchConfigs); 

    this.clearSearch(); 

    for (let i = 0; i < this.searchParams.length; i++) {
      var match = searchConfigs.filter(x => x.Name == this.searchParams[i].Name)[0];
      if (match)
      {
        this.searchParams[i].SelectedValue = match.SelectedValue; 
        this.searchParams[i].SelectedValueList = match.SelectedValueList; 
        this.checkCascade(this.searchParams[i]); 
      }
      else  
      {
        console.log('Not Found ' + this.searchParams[i].Name); 
      }
     
    }

    //Run Search 
    this.searchSubmit(); 

  }

  searchStaging()
  {
    this.searchParams.push(
      {
        Name: 'WORKTYPE',
        SelectedValue: this.appDataService.currentModule
      }
    )
    localStorage.setItem('Staging-Data', JSON.stringify(this.searchParams));
    //Open up window 
    window.open("STAGING/Search", "_blank");  
  }

  saveSearchInit()
  {
    this.showSavedSearch = true; 
    this.saveSearchDataAdd = new SaveSearchModel(); 
    this.saveSearchDataAdd.ConfigName = this.saveSearchData.ConfigName;  
    
    //Get list of Search Names
    this.searchService.getSavedSearches(this.SearchConfig).pipe(
      tap(result => {
        this.saveSearchDataAdd.LK_SearchNames = result || [];
      }),
      catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
    ).subscribe();  
  }

  saveSearchSubmit()
  {
     if (!this.saveSearchDataAdd.Name && !this.saveSearchDataAdd.ID)
     {
        return; 
     }

     //Get the Configurations
     this.saveSearchDataAdd.SearchParam = []; 
     for (let i = 0; i < this.searchParams.length; i++) {
      if (this.searchParams[i].SelectedValueList || (this.searchParams[i].SelectedValue && this.searchParams[i].SelectedValue != '...')) {
        var item = {
            Name: this.searchParams[i].Name,
            SelectedValue: this.searchParams[i].SelectedValue ,
            SelectedValueList: this.searchParams[i].SelectedValueList 
        };

        this.saveSearchDataAdd.SearchParam.push(item); 
        
        //The options is already populated
      }
    }
     this.searchService.addSiteVisitLog('SEARCH', 'Saved Search', this.saveSearchDataAdd);

     this.searchService.saveSearchAdd(this.saveSearchDataAdd).pipe(
       tap(result => {
         console.log('result', result);
         if (result.errormessage) {
           //Notify message
           this.notificationService.notifyError("Add Search Failed", result.errormessage);
         }
         else {
          this.fetchSavedSearches(this.saveSearchDataAdd.ConfigName);
          this.notificationService.notifySuccess("Search Saved", "");
          this.showSavedSearch = false; 
         }
       }
       ),
       catchError(err => this.notificationService.notifyErrorInPipe(err, [])),
     ).subscribe();
  }
}


interface DropDownData {
  name: string,
  description: string
}


class SaveSearchModel {

  LK_SearchNames: any[]; 
  ConfigName: any; 
  SearchParam: any[]; 
  Name: string; 
  ID: string;
  SelectedItem: any; 
}

