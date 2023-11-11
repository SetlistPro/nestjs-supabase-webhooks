export interface SupabaseEventHandlerConfig {
  type: string;
  table: string;
  schema?: string;
}

type Operation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SupabasePayload {
  type: Operation;
  table: string;
  schema?: string;
  record?: Record<string, any>;
  old_record?: Record<string, any>;
}

export interface SupabaseModuleConfig {
  webhookConfig?: {
    headerName: string;
    secret: string;
  };
  enableEventLogs?: boolean;
  /**
   * An optional array of class decorators to apply to the `EventHandlerController`. These decorators can
   * only apply metadata that will be read at request time, and not read at start time (i.e. you cannot use
   * `@UseGuards()`, `@UseInterceptor()` or any other NestJS enhancer decorators)
   */
  decorators?: ClassDecorator[];
}
