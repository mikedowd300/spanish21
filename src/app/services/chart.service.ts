import { Injectable } from '@angular/core';
import { Chart } from 'chart.js/auto';


@Injectable({
  providedIn: 'root'
})
export class ChartService {
  
  chart: Chart;

  constructor() { }

}