import { Injectable } from '@nestjs/common';
import { SupabasePayload } from './supabase.interfaces';

@Injectable()
export class EventHandlerService {
  public handleEvent(event: SupabasePayload): any {
    // The implementation for this method is overridden by the containing module
  }
}
