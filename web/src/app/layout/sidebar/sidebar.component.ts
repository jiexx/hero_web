import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/tickets', title: '出境机票',  icon:'where_to_vote', class: '' },
    { path: '/tickets/arrive', title: '入境机票',  icon:'where_to_vote', class: '' },
    { path: '/post', title: '互助接机',  icon:'person_pin_circle', class: '' },
    { path: '/profile', title: '用户资料',  icon:'person', class: '' },
    //{ path: '/notifications', title: '通知信息',  icon:'notifications', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
