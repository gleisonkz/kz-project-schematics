import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: "<%=camelize(name)%>Sample",
})
export class SamplePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
