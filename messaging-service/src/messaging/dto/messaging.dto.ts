import { IsString, IsNotEmpty } from 'class-validator';

export class MessagingDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
