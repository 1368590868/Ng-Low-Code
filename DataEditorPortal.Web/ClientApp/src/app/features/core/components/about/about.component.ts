import { Component, OnInit } from '@angular/core';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  public HTML = '';
  constructor(private configDataService: ConfigDataService) {}

  ngOnInit(): void {
    this.configDataService.getHTMLData().subscribe(res => {
      this.HTML = res?.aboutHtml || '';
    });
  }
}
