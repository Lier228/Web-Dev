import { bootstrapApplication } from '@angular/platform-browser';
import { RootComponent } from './app/app';

bootstrapApplication(RootComponent)
  .catch(err => console.error(err));
