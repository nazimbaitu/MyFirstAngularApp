import { Pipe, PipeTransform } from '@angular/core';
import { fmtAmount } from '../../core/utils/formatters';
@Pipe({ name:'currencyFormat', standalone:true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value:number|null|undefined):string { return fmtAmount(Number(value)||0); }
}
