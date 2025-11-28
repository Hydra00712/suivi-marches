import { Component } from '@angular/core';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toasts: Toast[] = [];
  constructor(ts: ToastService){
    ts.events$.subscribe(t => { this.toasts = [t, ...this.toasts].slice(0,3); setTimeout(()=> this.dismiss(t.id), 3000); });
  }
  dismiss(id: string){ this.toasts = this.toasts.filter(t=>t.id!==id); }
}

