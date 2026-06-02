import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.config.get('CLERK_SECRET_KEY'),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.get('CLERK_SECRET_KEY'),
      });

      let dbUser = await this.usersService.findByClerkId(payload.sub);
      if (!dbUser) {
        const clerkUser = await this.clerk.users.getUser(payload.sub);
        dbUser = await this.usersService.create({
          clerkId: payload.sub,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          firstName: clerkUser.firstName ?? '',
          lastName: clerkUser.lastName ?? '',
          avatar: clerkUser.imageUrl,
        });
      }

      request.user = dbUser;
      return true;
    } catch (err) {
      this.logger.error('Auth failed', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
