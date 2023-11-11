import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectSupabaseConfig } from './supabase.decorators';
import { SupabaseModuleConfig } from './supabase.interfaces';

@Injectable()
export class SupabaseEventHandlerHeaderGuard implements CanActivate {
  constructor(
    @InjectSupabaseConfig()
    private readonly supabaseWebhookConfig: SupabaseModuleConfig
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    if(!this.supabaseWebhookConfig.webhookConfig) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const secretRequestHeader =
      request.headers[this.supabaseWebhookConfig.webhookConfig.headerName];

    return secretRequestHeader === this.supabaseWebhookConfig.webhookConfig.secret;
  }
}
