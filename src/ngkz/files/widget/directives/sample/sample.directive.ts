import { Directive } from '@angular/core';

@Directive({
  selector: '[<%=dasherize(prefix)%>-sample]',
})
export class SampleDirective {}
