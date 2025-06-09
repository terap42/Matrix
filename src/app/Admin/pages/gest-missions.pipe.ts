import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gestMissions'
})
export class GestMissionsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
