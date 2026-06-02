import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserDecorator } from '@remlore/words-api/core'
import { LearningStatus } from '@remlore/words-api/prisma'
import { UserWordsService } from './user-words.service'

@Controller('user-words')
@UseGuards(AuthGuard('jwt'))
export class UserWordsController {
  constructor(private readonly userWordsService: UserWordsService) {}

  @Post('status')
  async updateWordStatus(
    @UserDecorator('id') userId: string,
    @Body() body: { wordId: string; status: LearningStatus }
  ) {
    return this.userWordsService.updateWordStatus(userId, body.wordId, body.status)
  }

  @Post('library')
  async addToLibrary(
    @UserDecorator('id') userId: string,
    @Body() body: { wordId: string; libraryName: string }
  ) {
    return this.userWordsService.addToLibrary(userId, body.wordId, body.libraryName)
  }

  @Get('libraries')
  async getUserLibraries(@UserDecorator('id') userId: string) {
    return this.userWordsService.getUserLibraries(userId)
  }

  @Get('libraries/:id')
  async getLibraryWords(@UserDecorator('id') userId: string, @Param('id') libraryId: string) {
    return this.userWordsService.getLibraryWords(userId, libraryId)
  }

  @Get('settings')
  async getSettings(@UserDecorator('id') userId: string) {
    return this.userWordsService.getSettings(userId)
  }

  @Put('settings')
  async updateSettings(
    @UserDecorator('id') userId: string,
    @Body() body: { dailyWordLimit: number }
  ) {
    return this.userWordsService.updateSettings(userId, body.dailyWordLimit)
  }
}
