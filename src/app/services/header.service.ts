import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  public showHeader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor() { }

}