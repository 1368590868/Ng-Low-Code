import { Component, OnInit } from '@angular/core';
import { ConfigDataService } from 'src/app/shared';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public HTML = '';
  constructor(private configDataService: ConfigDataService) {}

  ngOnInit(): void {
    this.configDataService.getHTMLData().subscribe(res => {
      this.HTML = res?.contactHtml || '';
    });
  }
}
