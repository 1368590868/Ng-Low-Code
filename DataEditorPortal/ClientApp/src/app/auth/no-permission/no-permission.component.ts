import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-permission',
  templateUrl: './no-permission.component.html',
  styleUrls: ['./no-permission.component.css']
})
export class NoPermissionComponent implements OnInit {

  constructor(
    private location: Location,
  ) { }

  ngOnInit(): void {
    console.log('this.location', this.location);
  }

  goBack() {
    this.location.back();
  }
}
