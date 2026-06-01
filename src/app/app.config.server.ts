import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

import { ToastrService } from 'ngx-toastr';

class ServerToastrService {
  success() {}
  error() {}
  info() {}
  warning() {}
  clear() {}
  remove() {}
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: ToastrService, useClass: ServerToastrService }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
