import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Comment } from '../models/comment.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private key = 'comments';
  private _comments$ = new BehaviorSubject<Comment[]>(this.storage.getItem<Comment[]>(this.key, []));
  comments$ = this._comments$.asObservable();

  constructor(private storage: StorageService) {}

  private save(){ this.storage.setItem(this.key, this._comments$.value); }
  list(): Comment[]{ return this._comments$.value; }
  byTask(taskId: string): Comment[]{ return this._comments$.value.filter(c => c.taskId === taskId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }

  add(data: Omit<Comment, 'id'|'createdAt'>){
    const c: Comment = { id: 'c-' + Math.random().toString(36).slice(2,9), createdAt: new Date().toISOString(), ...data };
    this._comments$.next([c, ...this._comments$.value]); this.save();
  }
  remove(id: string){ this._comments$.next(this._comments$.value.filter(c => c.id!==id)); this.save(); }
}

