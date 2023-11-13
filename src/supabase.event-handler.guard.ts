import {CanActivate, ExecutionContext, Injectable, Inject, Logger} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectSupabaseConfig } from './supabase.decorators';
import { SupabaseModuleConfig } from './supabase.interfaces';

@Injectable()
export class SupabaseEventHandlerHeaderGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseEventHandlerHeaderGuard.name);

  constructor(
    @InjectSupabaseConfig()
    private readonly supabaseWebhookConfig: SupabaseModuleConfig
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if(!this.supabaseWebhookConfig.webhookConfig) {
      this.logger.warn('Supabase Webhook Guard is not configured. Please check your SupabaseModule configuration.')
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const secretRequestHeader =
      request.headers[this.supabaseWebhookConfig.webhookConfig.headerName];

    console.log(secretRequestHeader);

    const isAuthentic = secretRequestHeader === this.supabaseWebhookConfig.webhookConfig.secret;

    if(!isAuthentic) {
      this.logger.warn('Supabase Webhook Guard: Request could not be authentified.')
      return false;
    }

    return true;
  }
}
