import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { EventHandlerService } from './supabase.event-handler.service';
import { SupabasePayload } from './supabase.interfaces';
import { Request } from 'express';

@Controller('/supabase')
export class EventHandlerController {
  constructor(private readonly eventHandlerService: EventHandlerService) {}

  // @UseGuards(SupabaseWebhooksEventHandlerHeaderGuard)
  @Post('/events')
  @HttpCode(202)
  async handleEvent(@Req() request: Request, @Body() event: SupabasePayload) {
    console.log('Request', request);
    const response = await this.eventHandlerService.handleEvent(event);
    return response == undefined ? { success: true } : response;
  }
}
