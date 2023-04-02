import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  faTrashCan,
  IconDefinition,
} from '@fortawesome/free-regular-svg-icons';
import {
  faFolderPlus,
  faForwardFast,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Music } from '../../services/music-api.interface';

export interface MusicComponentConfiguration {
  votable: boolean;
  deletable: boolean;
  queueable: boolean;
  backlog: boolean;
}

export interface IconUpdateStatus {
  updateLoading: (loading: boolean) => void;
  updateIcon: (icon: IconDefinition) => void;
  completeEmitter: () => void;
}

@Component({
  selector: 'musira-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss'],
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

  @Output()
  vote = new EventEmitter<IconUpdateStatus>();

  @Output()
  delete = new EventEmitter<IconUpdateStatus>();

  @Output()
  addToQueue = new EventEmitter<IconUpdateStatus>();

  @Output()
  addToBacklog = new EventEmitter<IconUpdateStatus>();

  iconDelete = faTrashCan;
  iconForward = faForwardFast;
  iconAdd = faPlus;
  iconBacklog = faFolderPlus;

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
