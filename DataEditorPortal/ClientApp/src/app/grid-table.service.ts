import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from './table/table.component';

@Injectable({
  providedIn: 'root'
})
export class GridTableService {
  constructor(private http: HttpClient) {}

  getCustomersLarge() {
    return this.http
      .get<any>('assets/customers-large.json')
      .toPromise()
      .then(res => <Customer[]>res.data)
      .then(data => {
        return data;
      });
  }
}
