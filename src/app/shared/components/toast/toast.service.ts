import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast { id: string; text: string; type?: 'info'|'success'|'error'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _events = new Subject<Toast>();
  events$ = this._events.asObservable();
  show(text: string, type: Toast['type']='info'){ this._events.next({ id: Math.random().toString(36).slice(2,9), text, type }); }
}

