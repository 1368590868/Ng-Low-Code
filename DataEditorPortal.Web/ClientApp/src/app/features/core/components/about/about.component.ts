import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  public HTML: SafeHtml = '';
  constructor(
    private configDataService: ConfigDataService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.configDataService.getHTMLData('about').subscribe(res => {
      this.HTML = this.domSanitizer.bypassSecurityTrustHtml(res);
    });
  }
}
