export class MessageDto {
  readonly header: {
    readonly JWTtoken: string;
    readonly userName: string;
    readonly sentAt: Date;
    readonly channel: string;
  };
  readonly text: string;
}
