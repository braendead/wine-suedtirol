import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'language',
  standalone: true
})
export class LanguagePipe implements PipeTransform {
  transform(detail: any): string {
    if (!detail) return '';
    return detail.de?.Title || detail.it?.Title || detail.en?.Title || 'Unbekannt';
  }
}
