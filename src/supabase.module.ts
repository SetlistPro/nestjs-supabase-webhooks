import {DiscoveryModule, DiscoveryService} from '@golevelup/nestjs-discovery';
import {createConfigurableDynamicRootModule} from '@golevelup/nestjs-modules';
import {BadRequestException, Logger, Module, OnModuleInit} from '@nestjs/common';
import {PATH_METADATA} from '@nestjs/common/constants';
import {flatten, groupBy} from 'lodash';
import {ExternalContextCreator} from '@nestjs/core/helpers/external-context-creator';
import {EventHandlerController} from './supabase.event-handler.controller';
import {SUPABASE_EVENT_HANDLER, SUPABASE_MODULE_CONFIG} from './supabase.constants';
import {
  SupabasePayload,
  SupabaseEventHandlerConfig,
  SupabaseModuleConfig,
} from './supabase.interfaces';
import {InjectSupabaseConfig} from './supabase.decorators';
import {EventHandlerService} from './supabase.event-handler.service';
import {SupabaseEventHandlerHeaderGuard} from './supabase.event-handler.guard';

function isSupabaseEvent(value: any): value is SupabasePayload {
  return ['type', 'table', 'schema'].every((it) => it in value);
}

@Module({
  imports: [DiscoveryModule],
  controllers: [EventHandlerController],
})
export class SupabaseModule extends createConfigurableDynamicRootModule<SupabaseModule, SupabaseModuleConfig>(
  SUPABASE_MODULE_CONFIG,
  {
    providers: [
      {
        provide: Symbol('CONTROLLER_HACK'),
        useFactory: (config: SupabaseModuleConfig) => {
          const controllerPrefix = 'supabase';

          Reflect.defineMetadata(
            PATH_METADATA,
            controllerPrefix,
            EventHandlerController
          );

          config.decorators?.forEach((deco) => {
            deco(EventHandlerController);
          });
        },
        inject: [SUPABASE_MODULE_CONFIG],
      },
      EventHandlerService,
      SupabaseEventHandlerHeaderGuard,
    ],
  }
) implements OnModuleInit {
  private readonly logger = new Logger(SupabaseModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    @InjectSupabaseConfig()
    private readonly supabaseModuleConfig: SupabaseModuleConfig,
  ) {
    super();
  }

  public async onModuleInit() {
    this.logger.log('Initializing Supabase Webhooks Module');

    const eventHandlerMeta =
      await this.discover.providerMethodsWithMetaAtKey<SupabaseEventHandlerConfig>(
        SUPABASE_EVENT_HANDLER,
      );

    if (!eventHandlerMeta.length) {
      this.logger.log('No Supabase Webhooks event handlers were discovered');
      return;
    }

    this.logger.log(
      `Discovered ${eventHandlerMeta.length} Supabase Webhooks event handlers`,
    );

    const grouped = groupBy(
      eventHandlerMeta,
      (x) => x.discoveredMethod.parentClass.name,
    );

    const eventHandlers = flatten(
      Object.keys(grouped).map((x) => {
        this.logger.log(`Registering supabase webhooks event handlers from ${x}`);

        return grouped[x].map(({discoveredMethod, meta: config}) => {
          return {
            key: `${config.type}-${config.schema}-${config.table}`,
            handler: this.externalContextCreator.create(
              discoveredMethod.parentClass.instance,
              discoveredMethod.handler,
              discoveredMethod.methodName,
              undefined, // metadataKey
              undefined, // paramsFactory
              undefined, // contextId
              undefined, // inquirerId
              undefined, // options
              'supabase_webhook_event', // contextType
            ),
          };
        });
      }),
    );

    console.log(eventHandlers);

    const [eventHandlerServiceInstance] = await (
      await this.discover.providers((x) => x.name === EventHandlerService.name)
    ).map((x) => x.instance);

    const eventHandlerService =
      eventHandlerServiceInstance as EventHandlerService;

    eventHandlerService.handleEvent = (evt: Partial<SupabasePayload>) => {
      if (!isSupabaseEvent(evt)) {
        throw new Error('Not a Supabase Event');
      }
      const keys = [`${evt.type}-${evt?.schema}-${evt?.table}`];

      // TODO: this should use a map for faster lookups
      const handlers = eventHandlers.filter((x) => keys.includes(x.key));

      if (this.supabaseModuleConfig.enableEventLogs) {
        this.logger.log(`Received event for: ${keys}`);
      }

      if (handlers && handlers.length) {
        return Promise.all(handlers.map((x) => x.handler(evt)));
      } else {
        const errorMessage = `Handler not found for ${keys}`;
        this.logger.error(errorMessage);
        throw new BadRequestException(errorMessage);
      }
    };
  }

}
