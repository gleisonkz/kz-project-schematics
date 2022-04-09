import { NgModule } from '@angular/core';

import { SamplePipe } from './sample.pipe';

@NgModule({
  declarations: [SamplePipe],
  exports: [SamplePipe]
})
export class IncludesPipeWidgetModule { }
