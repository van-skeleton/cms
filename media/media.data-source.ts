import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ListByPage } from 'ngx-bit';
import { MediaService } from './media.service';

export class MediaDataSource extends DataSource<any> {
  lists: ListByPage;
  private pages = new Set<number>();
  private IDs = new Map<any, number>();

  updating = false;
  private queue: any[] = [];
  private size: number;
  private stream = new BehaviorSubject<any[]>([]);
  private disconnect$ = new Subject<void>();

  constructor(
    private media: MediaService
  ) {
    super();
  }

  update(size: number): void {
    if (size === this.size) {
      return;
    }
    this.updating = true;
    this.queue = [];
    this.size = size;
    this.fetchData(true);
  }

  empty(): boolean {
    return this.lists.data.length === 0;
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    collectionViewer.viewChange.pipe(
      takeUntil(this.disconnect$)
    ).subscribe(range => {
      this.lists.index = Math.floor(range.end * this.size / this.lists.limit) + 1;
      this.fetchData();
    });
    return this.stream;
  }

  disconnect(): void {
    this.disconnect$.next();
    this.disconnect$.complete();
  }

  fetchData(refresh = false): void {
    if (refresh) {
      this.lists.data = [];
      this.lists.index = 1;
      this.pages.clear();
      this.IDs.clear();
    }
    if (this.pages.has(this.lists.index)) {
      return;
    }
    this.pages.add(this.lists.index);
    this.lists.ready.pipe(
      switchMap(() => this.media.lists(this.lists, refresh, true))
    ).subscribe(data => {
      this.lists.data.splice(this.lists.index * this.lists.limit, this.lists.limit, ...data);
      this.lists.data.forEach(((value, index) => {
        this.IDs.set(value.id, index);
        const key = Math.trunc(index / this.size);
        if (!this.queue[key]) {
          this.queue[key] = [];
        }
        if (this.queue[key].length !== this.size) {
          this.queue[key].push(value);
        }
      }));
      this.lists.refreshStatus();
      this.stream.next(this.queue);
      this.updating = false;
    });
  }

  delete(ids: any[]): void {
    for (const id of ids) {
      delete this.lists.data[this.IDs.get(id)];
    }
    this.lists.refreshStatus();
    this.stream.next(this.lists.data);
  }
}
