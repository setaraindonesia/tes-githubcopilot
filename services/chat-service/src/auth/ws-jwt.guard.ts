import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    
    try {
      const token = this.authService.extractTokenFromSocket(client);
      
      if (!token) {
        console.log('WebSocket: No token provided');
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return false;
      }

      const payload = await this.authService.verifyToken(token);
      
      // Store user info in client for later use
      client.user = payload;
      
      return true;
    } catch (error) {
      console.log('WebSocket authentication failed:', error.message);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
      return false;
    }
  }
}

