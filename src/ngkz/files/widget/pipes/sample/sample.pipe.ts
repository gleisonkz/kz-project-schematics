import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '<%=camelize(prefix)%>Sample',
})
export class SamplePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
