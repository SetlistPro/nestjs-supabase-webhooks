import {makeInjectableDecorator} from '@golevelup/nestjs-common';
import {applyDecorators, SetMetadata} from '@nestjs/common';
import {SUPABASE_EVENT_HANDLER, SUPABASE_MODULE_CONFIG} from './supabase.constants';
import {SupabaseEventHandlerConfig} from './supabase.interfaces';

export const SupabaseEventHandler = (config: SupabaseEventHandlerConfig) => applyDecorators(SetMetadata(SUPABASE_EVENT_HANDLER, Object.assign({
  schema: 'public'
}, config)));

export const InjectSupabaseConfig = makeInjectableDecorator(SUPABASE_MODULE_CONFIG);
