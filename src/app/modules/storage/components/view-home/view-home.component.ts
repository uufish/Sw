import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/internal/Observable';

import { Post } from '../../../../interfaces/post';
import { BrowserService } from '../../../../services/browser.service';
import { PostsService } from '../../../../services/posts.service';

@Component({
  selector: 'app-view-home',
  template: `
    <ng-container *ngIf='(posts$ | async) as posts; else loader'>
      <ng-container *ngFor='let post of posts'>
        <app-card-image [post]='post'></app-card-image>
      </ng-container>
    </ng-container>

    <ng-template #loader>
      <div sw-loader></div>
    </ng-template>
  `,
  styleUrls: ['view-home.component.scss'],
})
export class ViewHomeComponent implements OnInit {
  public posts$: Observable<Post[]>;

  constructor(
    private postsService: PostsService,
    private browser: BrowserService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    this.posts$ = this.postsService.getPostsAsPhoto((ref) => {
      return ref.limit(50).orderBy('createdAt', 'desc');
    });
    this.browser.updateSnapshot(this.activatedRoute.snapshot);
  }
}
