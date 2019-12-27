
import { enableProdMode, ReflectiveInjector, COMPILER_OPTIONS, InjectionToken } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';
import { ConfigService } from 'app/common/net.config';

const config = ReflectiveInjector.resolveAndCreate([ConfigService]).get(ConfigService);
// function alter(tag, attr){
//   var links = document.getElementsByTagName(tag);
//   for ( var i=0;i<links.length;i++ ) {
//     var href = links[i].getAttribute(attr);
//     if(href.length > 0){
//       links[i].setAttribute(attr ,config.FONT_HOST.URL+href);      
//     }
//   }
// }
// alter('link', 'href');
// alter('script', 'src')
var e = document.getElementById('__font');
if(e){
  var href = e.getAttribute('href');
  e.setAttribute('href' ,config.FONT_HOST.URL+href);      
}

if (environment.production) {
  enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule);
