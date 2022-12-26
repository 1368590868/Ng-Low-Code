import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../services/app-data.service';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-action-table',
  templateUrl: './action-table.component.html',
  styleUrls: ['./action-table.component.css']
})
export class ActionTableComponent implements OnInit {
  cols: any[]
  cars: any[]
  constructor(
    private appDataService: AppDataService,
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'vin', header: 'Vin' },
      { field: 'year', header: 'Year' },
      { field: 'brand', header: 'Brand' },
      { field: 'color', header: 'Color' }
    ];
    this.cars = [
      { vin: 'r3278r2', year: 2010, brand: 'Audi', color: 'Black' },
      { vin: 'jhto2g2', year: 2015, brand: 'BMW', color: 'White' },
      { vin: 'h453w54', year: 2012, brand: 'Honda', color: 'Blue' },
      { vin: 'g43gwwg', year: 1998, brand: 'Renault', color: 'White' },
      { vin: 'gf45wg5', year: 2011, brand: 'VW', color: 'Red' },
      { vin: 'bhv5y5w', year: 2015, brand: 'Jaguar', color: 'Blue' },
      { vin: 'ybw5fsd', year: 2012, brand: 'Ford', color: 'Yellow' },
      { vin: '45665e5', year: 2011, brand: 'Mercedes', color: 'Brown' },
      { vin: 'he6sb5v', year: 2015, brand: 'Ford', color: 'Black' },
      { vin: 'av5svnb', year: 2016, brand: 'Mercedes', color: 'Red' },
      { vin: 'jsja3ia', year: 2015, brand: 'Volvo', color: 'White' },
      { vin: 'hsd77sa', year: 2016, brand: 'Honda', color: 'Yellow' },

    ]

    this.appDataService.searchClicked$.pipe(
      tap(searchParams => {
        console.log(searchParams,'searchparams')
        //this.isRunning = true;
      
      }),
    ).subscribe();
  }

  onLazyLoad(event) {
    console.log(event, 'event')
  }


}
