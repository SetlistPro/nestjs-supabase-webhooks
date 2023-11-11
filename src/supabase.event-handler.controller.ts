import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { EventHandlerService } from './supabase.event-handler.service';
import { SupabasePayload } from './supabase.interfaces';
import {SupabaseEventHandlerHeaderGuard} from './supabase.event-handler.guard';

@Controller('/supabase')
export class EventHandlerController {
  constructor(private readonly eventHandlerService: EventHandlerService) {}

  @UseGuards(SupabaseEventHandlerHeaderGuard)
  @Post('/events')
  @HttpCode(202)
  async handleEvent(@Body() event: SupabasePayload) {
    const response = await this.eventHandlerService.handleEvent(event);
    return response == undefined ? { success: true } : response;
  }
}
