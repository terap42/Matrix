import { Component, OnInit } from '@angular/core';
import { TabsLayoutService } from './tabs-layout.service';

@Component({
  selector: 'app-tabs-layout',
  templateUrl: './tabs-layout.page.html',
  styleUrls: ['./tabs-layout.page.scss'],
  standalone: false,
})
export class TabsLayoutPage implements OnInit {
  hideTabs: boolean = true;
  constructor(private tabsLayoutService: TabsLayoutService) { }

  ngOnInit() {}
  
}
