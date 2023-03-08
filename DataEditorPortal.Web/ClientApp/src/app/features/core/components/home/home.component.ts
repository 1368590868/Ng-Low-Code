import { Component, OnInit } from '@angular/core';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public siteVersion = '';
  constructor(private configData: ConfigDataService) {}

  ngOnInit(): void {
    this.configData.getSiteVersion().subscribe((data: any) => {
      this.siteVersion = `Site Version ${data.version}, Release Date ${data.date}`;
    });
  }
}
