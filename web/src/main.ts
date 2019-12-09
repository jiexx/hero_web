/*!

=========================================================
* Material Dashboard Angular - v2.3.0
=========================================================



=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { enableProdMode, ReflectiveInjector } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';
import { ConfigService } from 'app/common/net.config';

var config = ReflectiveInjector.resolveAndCreate([ConfigService]).get(ConfigService);
document.getElementById('fonts').setAttribute('href',config.FONT_HOST.URL);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
