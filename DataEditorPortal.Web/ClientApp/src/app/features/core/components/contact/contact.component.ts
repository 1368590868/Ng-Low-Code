import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public HTML: SafeHtml = '';
  constructor(
    private configDataService: ConfigDataService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.configDataService.getHTMLData('contact').subscribe(res => {
      this.HTML = this.domSanitizer.bypassSecurityTrustHtml(res);
    });
  }
}
