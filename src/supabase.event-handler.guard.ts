import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectSupabaseConfig } from './supabase.decorators';
import { SupabaseModuleConfig } from './supabase.interfaces';
import * as crypto from 'crypto';
import {Request} from 'express';

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
    const headerName = this.supabaseWebhookConfig.webhookConfig.headerName || 'x-supabase-signature';
    const signature = request.headers[headerName];
    const body = request?.rawBody;

    const decodedSignature = Buffer.from(signature, 'base64');
    const calculatedSignature = crypto
      .createHmac('sha256', this.supabaseWebhookConfig.webhookConfig.secret)
      .update(body)
      .digest();

    const hmacMatch = crypto.timingSafeEqual(decodedSignature, calculatedSignature);

    if(!hmacMatch) {
      this.logger.warn('Supabase Webhook Guard: Request could not be authentified.')
      return false;
    } else {
      this.logger.log('Supabase Webhook Guard: Request authentified.')
    }

    return true;
  }
}
