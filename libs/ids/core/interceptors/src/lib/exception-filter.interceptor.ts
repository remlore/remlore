import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { RlResponse } from '@remlore/shared/util/types'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response<RlResponse>>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    response.status(status).json({
      success: false,
      message:
        typeof exceptionResponse === 'object' && 'message' in exceptionResponse
          ? (exceptionResponse['message'] as string)
          : (exceptionResponse as string),
      error: {
        code: status,
        details: exceptionResponse
      }
    })
  }
}
