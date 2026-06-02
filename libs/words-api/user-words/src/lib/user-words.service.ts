import { Injectable } from '@nestjs/common'
import { LearningStatus, PrismaService } from '@remlore/words-api/prisma'

@Injectable()
export class UserWordsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateWordStatus(userId: string, wordId: string, status: LearningStatus) {
    const existing = await this.prisma.userStudyWord.findFirst({
      where: { userId, wordId }
    })

    if (existing) {
      existing.status = status
      return this.prisma.userStudyWord.update({
        where: { id: existing.id },
        data: existing
      })
    }

    return this.prisma.userStudyWord.create({
      data: {
        userId,
        wordId,
        status
      }
    })
  }

  async addToLibrary(wordId: string, userId: string, libraryId: string) {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
      select: { userId: true }
    })

    if (!library || library.userId !== userId) {
      throw new Error('Library not found or access denied.')
    }

    await this.prisma.wordLibrary.upsert({
      where: {
        // Use the composite unique ID defined in the schema: @@id([wordId, libraryId])
        wordId_libraryId: {
          wordId: wordId,
          libraryId: libraryId
        }
      },
      update: {},
      create: {
        wordId: wordId,
        libraryId: libraryId
      }
    })
  }

  async getUserLibraries(userId: string) {
    return this.prisma.library.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        isPublic: true,
        description: true,
        _count: true
      }
    })
  }

  async getLibraryWords(userId: string, libraryId: string) {
    return this.prisma.word.findMany({
      where: {
        library: {
          some: { library: { id: libraryId, userId } }
        }
      },
    })
  }

  async updateSettings(userId: string, dailyWordLimit: number) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: { dailyWordLimit },
      create: { userId, dailyWordLimit }
    })
  }

  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({ where: { userId } })
    if (!settings) {
      settings = await this.prisma.userSettings.create({ data: { userId } })
    }
    return settings
  }
}
