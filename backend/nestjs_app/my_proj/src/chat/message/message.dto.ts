export class MessageDto {
  readonly header: {
    readonly JWTtoken: string;
    readonly username: string;
    readonly sentAt: Date;
    readonly channel: string;
  };
  readonly text: string;
}
