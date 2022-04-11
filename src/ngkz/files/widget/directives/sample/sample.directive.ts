import { Directive } from '@angular/core';

@Directive({
  selector: "[<%=dasherize(name)%>-sample]",
})
export class SampleDirective { }
