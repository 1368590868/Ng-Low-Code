import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'data-editor-portal';
  bgColor = 'bg-primary';

  constructor(
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig
  ) {}
  ngOnInit(): void {
    this.primengConfig.ripple = true;
  }

  handleClick() {
    this.bgColor = 'bg-blue-500';
    this.messageService.add({
      severity: 'error',
      summary: 'Service Message',
      detail: 'Via MessageService'
    });
    setTimeout(() => {
      this.bgColor = 'bg-pink-500';
    }, 1000);
  }
}
