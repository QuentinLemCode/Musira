import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { MusicSession } from '../../music-session/entities/music-session.entity';
import { SessionCreatorGuard } from '../../users/session-creator.guard';
import { UserRole } from '../../users/user.entity';
import { MusicSessionParam } from '../../utils/decorators/music-session.decorator';
import { FullBacklogDto, ImportResultDto } from '../dto/backlog.dto';
import { Music } from '../music.entity';
import { BacklogService } from './backlog.service';

@ApiTags('Backlog')
@ApiBearerAuth()
@ApiParam({ name: 'publicCode', type: Number })
@Controller('session/:publicCode/backlog')
export class BacklogController {
  constructor(private readonly backlog: BacklogService) {}

  @UseGuards(SessionCreatorGuard)
  @Post()
  @ApiOperation({ summary: 'Push a music to backlog' })
  @ApiCreatedResponse({ type: FullBacklogDto, isArray: true })
  pushToBacklog(
    @Body() music: Music,
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.backlog.push(musicSession, music);
  }

  @UseGuards(SessionCreatorGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a backlog item' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  async deleteBacklog(@Param('id') id: string) {
    try {
      await this.backlog.delete(id);
    } catch {
      throw new NotFoundException();
    }
  }

  @UseGuards(SessionCreatorGuard)
  @Get('')
  @ApiOperation({ summary: 'Get backlog for session' })
  @ApiOkResponse({ type: FullBacklogDto, isArray: true })
  getBackLog(@MusicSessionParam() musicSession: MusicSession) {
    return this.backlog.get(musicSession);
  }

  // TODO: move to its own class
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('import')
  @ApiOperation({ summary: 'Import a Spotify playlist into backlog' })
  @ApiBody({
    schema: {
      properties: {
        spotifyPlaylistId: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({ type: ImportResultDto })
  import(
    @Body() importParam: { spotifyPlaylistId: string },
    @MusicSessionParam() musicSession: MusicSession,
  ) {
    return this.backlog.import(importParam.spotifyPlaylistId, musicSession);
  }
}
