import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EventHandlerService } from './supabase.event-handler.service';
import { SupabasePayload } from './supabase.interfaces';

@Controller('/supabase')
export class EventHandlerController {
  constructor(private readonly eventHandlerService: EventHandlerService) {}

  // @UseGuards(SupabaseWebhooksEventHandlerHeaderGuard)
  @Post('/events')
  @HttpCode(202)
  async handleEvent(@Body() event: SupabasePayload) {
    const response = await this.eventHandlerService.handleEvent(event);
    return response == undefined ? { success: true } : response;
  }
}
