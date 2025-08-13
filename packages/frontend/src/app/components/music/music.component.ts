import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { IconDefinition as IconDefinitionRegular } from '@fortawesome/free-regular-svg-icons';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import type { IconDefinition as IconDefinitionSolid } from '@fortawesome/free-solid-svg-icons';
import {
  faFolderPlus,
  faForwardFast,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { Music } from '../../services/music-api.interface';

export interface MusicComponentConfiguration {
  votable: boolean;
  deletable: boolean;
  queueable: boolean;
  backlog: boolean;
}

type AllIconDefinition =
  | IconDefinition
  | IconDefinitionSolid
  | IconDefinitionRegular;

export interface IconUpdateStatus {
  updateLoading: (loading: boolean) => void;
  updateIcon: (icon: AllIconDefinition) => void;
  completeEmitter: () => void;
}

@Component({
  selector: 'musira-music',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  template: `
    <ng-container *ngIf="music">
      <div class="cover">
        <img [src]="music.cover" alt="album cover" />
      </div>
      <div class="info">
        <div class="title">{{ music.title }}</div>
        <div class="artist">{{ music.artist }}</div>
        <div *ngIf="username" class="adder">
          Ajouté par {{ username | titlecase }}
        </div>
        <div *ngIf="backlog" class="adder">Musique de la réserve</div>
        <div *ngIf="message" class="adder">
          {{ message }}
        </div>
      </div>
      <div class="vote" *ngIf="config?.votable">
        <button (click)="vote.emit(updateStatusDelete)">
          <fa-icon [icon]="iconForward"></fa-icon>
          <div
            class="vote-count"
            *ngIf="voteCount > 0"
            [ngClass]="loadingDelete ? ['fa-beat-fade'] : []"
          >
            {{ voteCount }}
          </div>
        </button>
      </div>
      <div class="remove" *ngIf="config?.deletable">
        <button (click)="delete.emit(updateStatusForward)">
          <fa-icon
            [icon]="iconDelete"
            [ngClass]="loadingForward ? ['fa-beat-fade'] : []"
          ></fa-icon>
        </button>
      </div>
      <div class="add-to-queue" *ngIf="config?.queueable">
        <button (click)="addToQueue.emit(updateStatusAdd)">
          <fa-icon
            [icon]="iconAdd"
            [ngClass]="loadingAdd ? ['fa-beat-fade'] : []"
          ></fa-icon>
        </button>
      </div>
      <div class="add-to-backlog" *ngIf="config?.backlog">
        <button (click)="addToBacklog.emit(updateStatusBacklog)">
          <fa-icon
            [icon]="iconBacklog"
            [ngClass]="loadingBacklog ? ['fa-beat-fade'] : []"
          ></fa-icon>
        </button>
      </div>
    </ng-container>
  `,
  styles: [
    `
      @use '../../../colors.scss' as *;

      :host {
        display: inline-flex;
        max-width: 100%;
        min-width: 100%;
        flex-direction: row;
        align-items: center;
        padding: 10px;
        gap: 10px;

        background: var(--bg-primary);
        border-radius: 15px;

        font-family: 'Poppins';
        font-style: normal;
        line-height: 24px;
        font-weight: 400;
        color: var(--font-primary);

        .cover {
          width: 60px;
          height: 60px;

          border-radius: 10px;
          order: 0;
          flex: 0 0 60px;
        }

        .info {
          flex: 1 1 auto;
          white-space: nowrap;
          overflow: hidden;
          div {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .adder {
          font-size: 12px;
          font-weight: 300;
        }

        .title {
          font-weight: 600;
        }

        button {
          padding: 15px 20px;
          flex-direction: column;
          align-items: center;
        }

        fa-icon {
          transition: all 0.5s;
        }
      }
    `,
  ],
})
export class MusicComponent implements OnInit {
  @Input()
  username?: string;

  @Input()
  music?: Music;

  @Input()
  voteCount = 0;

  @Input()
  config?: MusicComponentConfiguration;

  @Input()
  backlog = false;

  @Input()
  message = '';

  @Output()
  vote = new EventEmitter<IconUpdateStatus>();

  @Output()
  delete = new EventEmitter<IconUpdateStatus>();

  @Output()
  addToQueue = new EventEmitter<IconUpdateStatus>();

  @Output()
  addToBacklog = new EventEmitter<IconUpdateStatus>();

  iconDelete: AllIconDefinition = faTrashCan;
  iconForward: AllIconDefinition = faForwardFast;
  iconAdd: AllIconDefinition = faPlus;
  iconBacklog: AllIconDefinition = faFolderPlus;

  loadingDelete = false;
  loadingForward = false;
  loadingAdd = false;
  loadingBacklog = false;

  updateStatusDelete: IconUpdateStatus = {
    updateLoading: (loading) => (this.loadingDelete = loading),
    updateIcon: (icon) => (this.iconDelete = icon),
    completeEmitter: () => this.delete.complete(),
  };
  updateStatusForward: IconUpdateStatus = {
    updateLoading: (loading) => (this.loadingForward = loading),
    updateIcon: (icon) => (this.iconForward = icon),
    completeEmitter: () => this.vote.complete(),
  };
  updateStatusAdd: IconUpdateStatus = {
    updateLoading: (loading) => (this.loadingAdd = loading),
    updateIcon: (icon) => (this.iconAdd = icon),
    completeEmitter: () => this.addToQueue.complete(),
  };
  updateStatusBacklog: IconUpdateStatus = {
    updateLoading: (loading) => (this.loadingBacklog = loading),
    updateIcon: (icon) => (this.iconBacklog = icon),
    completeEmitter: () => this.addToBacklog.complete(),
  };

  ngOnInit(): void {
    if (!this.config) {
      this.config = {
        votable: false,
        deletable: false,
        queueable: false,
        backlog: false,
      };
    }
  }
}
