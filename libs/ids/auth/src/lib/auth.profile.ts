import { createMap, Mapper } from '@automapper/core'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { Injectable } from '@nestjs/common'
import { UserEntity } from '@remlore/ids/core/entities'
import { SignUpDto } from './dto'

@Injectable()
export class AuthProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  override get profile() {
    return (mapper: Mapper) => {
      // 1. Map SignUpDto (Input) -> Auth (Entity)
      createMap(mapper, SignUpDto, UserEntity)

      // 2. Map Auth (Entity) -> AuthDto (Output)
      // createMap(
      //   mapper,
      //   Auth,
      //   AuthDto,
      //   // Custom transformation: Combine first and last name
      //   forMember(
      //     (destination) => destination.fullName,
      //     mapFrom((source) => `${source.firstName} ${source.lastName}`)
      //   )
      // );
    }
  }
}
