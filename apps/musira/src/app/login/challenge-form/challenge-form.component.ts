import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'musira-challenge-form',
  templateUrl: './challenge-form.component.html',
  styleUrls: ['./challenge-form.component.scss'],
})
export class ChallengeFormComponent implements OnInit {
  private static readonly EMOJIS = [
    { emoji: '😂', description: 'Face with tears of joy' },
    { emoji: '❤️', description: 'Red heart' },
    { emoji: '💣', description: 'Bomb' },
    { emoji: '👍', description: 'Thumbs up' },
    { emoji: '🥁', description: 'Drum' },
    { emoji: '💻', description: 'Laptop' },
    { emoji: '🌍', description: 'Globe' },
    { emoji: '🎂', description: 'Birthday cake' },
    { emoji: '🍪', description: 'Cookie' },
    { emoji: '🔥', description: 'Fire' },
    { emoji: '🏨', description: 'Hotel' },
    { emoji: '🍔', description: 'Hamburger' },
  ];

  @Output()
  challengeSubmit = new EventEmitter<string>();

  emojis = this.shuffleEmoji(ChallengeFormComponent.EMOJIS);

  error = '';

  form = new FormGroup({
    emojiControl: new FormControl(''),
    birthYearControl: new FormControl('', {
      validators: [Validators.max(2020), Validators.min(1900)],
    }),
  });

  @ViewChild('input')
  yearInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    setTimeout(() => {
      this.yearInput.nativeElement.focus();
      window.scroll({ top: 0 });
    }, 0);
  }

  get emojiValue() {
    return this.form.controls.emojiControl.value;
  }

  get birthYearValue() {
    return this.form.controls.birthYearControl.value;
  }

  submit() {
    const challenge = this.getChallengeCode();
    if (challenge === null) {
      return;
    }
    this.challengeSubmit.next(challenge);
  }

  getChallengeCode() {
    if (this.form.controls.emojiControl.invalid || this.emojiValue === null) {
      this.error = 'Vous devez choisir un emoji.';
      return null;
    }
    if (
      this.form.controls.birthYearControl.invalid ||
      this.birthYearValue === null
    ) {
      this.error = 'Vous devez entrer votre année de naissance.';
      return null;
    }
    return this.emojiValue + this.birthYearValue;
  }

  private shuffleEmoji(emojis: typeof ChallengeFormComponent.EMOJIS) {
    let currentIndex = emojis.length,
      randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [emojis[currentIndex], emojis[randomIndex]] = [
        emojis[randomIndex],
        emojis[currentIndex],
      ];
    }

    return emojis;
  }
}
