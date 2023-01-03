import { PartialType } from '@nestjs/swagger';
import { CreateMessageDTO } from './create-message.dto';

export class UpdateMessageDTO extends PartialType(CreateMessageDTO) {}
