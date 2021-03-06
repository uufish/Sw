import { Component, Input } from '@angular/core';
import { pipe } from 'rxjs/internal-compatibility';
import { tap } from 'rxjs/operators';

import { Post } from '../../../../interfaces/post';
import { AuthService } from '../../../../services/auth.service';
import { PostsService } from '../../../../services/posts.service';

@Component({
  selector: 'app-list-item-post',
  template: `
    <!-- template photoURLs -->
    <ng-container *ngIf="post.photoURLs.length">
      <div class="template-photoURLs">
        <ng-container *ngFor="let photoURL of post.photoURLs">
          <img [routerLink]="link" [src]="photoURL | resize:'post'">
        </ng-container>
      </div>
    </ng-container>

    <!-- template replyPostId -->
    <ng-container *ngIf='post.replyPostId'>
      <div class="template-replyPostId">
        <a routerLink="/posts/{{post.replyPostId}}">{{post.replyPostId}}</a>
      </div>
    </ng-container>

    <!-- template content -->
    <div class="template-content" [routerLink]="link">
      <ng-container *ngIf="post.content">
        <p class='text'>{{post.content}}<span class="createdAt">- {{post.createdAt | elapsedDate}}</span></p>
      </ng-container>
      <ng-container *ngIf="!post.content">
        <p><span class="createdAt">- {{post.createdAt | elapsedDate}}</span></p>
      </ng-container>
    </div>

    <!-- template listItemActions -->
    <div class='template-actions'>
      <div mdc-chip-set>
        <ng-container *ngFor="let tag of post.tags">
          <div mdc-chip (click)="onUpdateTag(tag.name)">
            <div mdc-chip-text>{{tag.name}} {{tag.count}}</div>
          </div>
        </ng-container>
        <ng-container *ngIf="isLogged && !isEditNewTag">
          <button mdc-chip class='mdc-chip--button' (click)="onEditNewTag()">
            <i mdc-chip-icon leading material-icons>add</i>
            <div class='fix-height'></div>
          </button>
        </ng-container>
        <ng-container *ngIf="isLogged && isEditNewTag">
          <div mdc-chip>
            <i mdc-chip-icon leading material-icons>add</i>
            <input
              mdc-chip-text
              [(ngModel)]="newTag"
              [disabled]="isLoadingMutation"
              class='mdc-chip__text--editable'
              placeholder='いいね'
              (blur)="onUpdateTag(newTag)"
            >
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['list-item-post.component.scss'],
})
export class ListItemPostComponent {
  public isEditNewTag = false;
  public isLoadingMutation = false;
  public newTag = '';

  @Input() public post: Post;
  @Input() public isLogged: boolean;

  constructor(
    public authService: AuthService,
    private posts: PostsService,
  ) {
  }

  public get link(): string {
    return this.post.replyPostId
      ? `/posts/${this.post.replyPostId}`
      : `/posts/${this.post.id}`;
  }

  public onUpdateTag(name: string): void {
    if (!this.authService.currentUser) {
      return;
    }

    if (this.isLoadingMutation) {
      return;
    }

    this.isLoadingMutation = true;

    if (name === '') {
      this.isEditNewTag = false;
      this.isLoadingMutation = false;
      return;
    }

    const post$ = this.posts.updatePostTag({postId: this.post.id, name});

    const pipeline = pipe(
      tap(() => {
        this.isLoadingMutation = false;
      }),
    );

    pipeline(post$).subscribe((res) => {
      this.newTag = '';
    }, (err) => {
      console.error(err);
    });
  }

  public onEditNewTag(): void {
    this.isEditNewTag = true;
  }
}
