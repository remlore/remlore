import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { RlResponse } from '@remlore/shared/util/types'
import { map } from 'rxjs/operators'

@Injectable()
export class TransformInterceptor<
  T extends Record<string, any> | undefined = any
> implements NestInterceptor<T, RlResponse> {
  intercept(_context: ExecutionContext, next: CallHandler<T>) {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data,
        message: typeof data === 'object' && 'message' in data ? (data as any).message : undefined,
        error: null
      }))
    )
  }
}
