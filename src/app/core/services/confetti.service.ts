import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfettiService {
  private _trigger$ = new Subject<void>();
  trigger$ = this._trigger$.asObservable();

  fire() {
    this._trigger$.next();
  }
}

