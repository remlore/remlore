// auth/scope.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class OidcScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.get<string[]>('scopes', context.getHandler())

    if (!requiredScopes) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.scope) {
      throw new UnauthorizedException('Invalid token scope')
    }

    const userScopes = user.scope.split(' ')
    const hasRequiredScopes = requiredScopes.every((scope) => userScopes.includes(scope))

    if (!hasRequiredScopes) {
      throw new UnauthorizedException('Insufficient permissions')
    }

    return true
  }
}
