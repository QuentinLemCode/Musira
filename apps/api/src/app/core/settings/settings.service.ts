import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings as Settings } from './settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  setting: Settings;
  constructor(
    @InjectRepository(Settings)
    private readonly settings: Repository<Settings>,
  ) {}

  async onModuleInit() {
    let setting = await this.settings.findOneBy({ id: 1 });
    if (setting === null) {
      setting = this.settings.create({ id: 1 });
      this.settings.save(setting);
    }
    this.setting = setting;
  }

  get maxVotes() {
    return this.setting.maxVotes;
  }

  async setMaxVotes(value: number) {
    this.setting.maxVotes = value;
    await this.settings.save(this.setting);
  }

  get maxQueuableSongPerUser() {
    return this.setting.maxQueuableSongPerUser;
  }

  async setMaxQueuableSongPerUser(value: number) {
    this.setting.maxQueuableSongPerUser = value;
    await this.settings.save(this.setting);
  }
}
