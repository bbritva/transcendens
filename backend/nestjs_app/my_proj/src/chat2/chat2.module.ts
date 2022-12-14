import { Module } from "@nestjs/common";
import { MyChat2 } from "./chat2";

@Module({
    providers: [MyChat2]
})
export class ChatModule{
    
}