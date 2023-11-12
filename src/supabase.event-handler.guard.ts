import {CanActivate, ExecutionContext, Injectable, Inject, Logger} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectSupabaseConfig } from './supabase.decorators';
import { SupabaseModuleConfig } from './supabase.interfaces';

@Injectable()
export class SupabaseEventHandlerHeaderGuard implements CanActivate {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
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

    const isAuthentic = secretRequestHeader === this.supabaseWebhookConfig.webhookConfig.secret;

    if(!isAuthentic) {
      this.logger.warn('Supabase Webhook Guard: Request could not be authentified.')
      return false;
    }

    return true;
  }
}
