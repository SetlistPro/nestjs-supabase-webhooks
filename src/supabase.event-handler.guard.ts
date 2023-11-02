import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectSupabaseConfig } from './supabase.decorators';
import { SupabaseModuleConfig } from './supabase.interfaces';

@Injectable()
export class SupabaseEventHandlerHeaderGuard implements CanActivate {
  constructor(
    @InjectSupabaseConfig()
    private readonly supabaseWebhookConfig: SupabaseModuleConfig
  ) {
    // this.apiSecret =
    //   typeof supabaseWebhookConfig.webhookConfig.secretFactory === 'function'
    //     ? supabaseWebhookConfig.webhookConfig.secretFactory()
    //     : supabaseWebhookConfig.webhookConfig.secretFactory;
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
  //   const request = context.switchToHttp().getRequest<Request>();
  //
  //   const secretRequestHeader =
  //     request.headers[this.supabaseWebhookConfig.webhookConfig.secretHeader];
  //
  //   return secretRequestHeader === this.apiSecret;
  // }
}
