import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    allowedHeaders: ['Authorization', 'authorization'],
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const user = await this.verifyUser(client);
    if(!user) client.disconnect();
  }

  async sendToRoom(room: any, name: string, data:any) {
    this.server.to(room).emit(name, data);
  }

  async emit(name: string, data:any) {
    this.server.emit(name, data);
  }

  handleDisconnect(client: Socket) {
  }

  async verifyUser(client) {
    if (!client.handshake?.query?.access_token) return [null, null];

    const payload = await this.jwtService.verifyAsync(
      client.handshake.query.access_token,
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET')
      }
    );
    return payload;
  }
}
