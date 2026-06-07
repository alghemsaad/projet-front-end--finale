import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

interface RequestWithUser extends Express.Request {
  user: JwtPayload;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return true; // No user = public route
    return true; // Allow all authenticated users, check roles in controller
  }
}
