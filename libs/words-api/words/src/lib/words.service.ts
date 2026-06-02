import { Injectable } from '@nestjs/common'
import { PrismaService } from '@remlore/words-api/prisma'
import axios from 'axios'

@Injectable()
export class WordsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyWords(userId: string) {
    let settings = await this.prisma.userSettings.findFirst({
      where: { userId }
    })
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId }
      })
    }

    // Get words user has already seen
    const seenWords = await this.prisma.userStudyWord.findMany({
      where: { id: userId },
      select: { wordId: true },
      distinct: ['wordId']
    })

    // Get random words excluding seen ones
    const words = await this.prisma.word.findMany({
      where: {
        // Exclude all IDs in the seenWordIds array
        id: {
          notIn: seenWords.map((w) => w.wordId)
        }
      },
      take: settings.dailyWordLimit // Take only the number of words requested
    })

    return words
  }

  async seedWords() {
    const count = await this.prisma.word.count()
    if (count > 0) return

    // Fetch words from free API - Random Word API
    try {
      const response = await axios.get('https://random-word-api.herokuapp.com/word?number=100')
      const words = response.data

      const wordsWithImages = await Promise.all(
        words.map(async (word: string) => {
          // Get word definition from Free Dictionary API
          let definition = ''
          let example = ''

          try {
            const dictResponse = await axios.get(
              `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
            )
            const data = dictResponse.data[0]
            definition = data.meanings[0]?.definitions[0]?.definition || ''
            example = data.meanings[0]?.definitions[0]?.example || ''
          } catch {
            console.log(`No definition found for ${word}`)
          }

          return {
            word,
            imageUrl: `https://source.unsplash.com/200x200/?${word}`,
            definition,
            example,
            difficulty: 1
          }
        })
      )

      await this.prisma.word.createMany({
        data: wordsWithImages
      })
      console.log('Words seeded successfully!')
    } catch (error) {
      console.error('Error seeding words:', error)
    }
  }

  async getWordDetails(wordId: string) {
    return this.prisma.word.findFirst({ where: { id: wordId } })
  }
}
