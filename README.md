# Nest.js Supabase Webhooks

This is a simple Nest.js module that allows you to easily integrate Supabase Database Webhooks into your Nest.js application.

## Requirements

- Nest.js 10.x or higher
- Supabase Database Webhook, setup with HMAC Signature

## Installation

```bash
npm install --save nestjs-supabase-webhooks
```

## Usage

Import the `SupabaseWebhooksModule` into your root application module.

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from 'nestjs-supabase-webhooks';
import { InvitationsService } from './invitations/invitations.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SupabaseModule.forRoot(SupabaseModule, {
      enableEventLogs: true,
      webhookConfig: {
        secret: process.env.SUPABASE_WEBHOOK_SECRET,
        headerName: 'x-supabase-signature', // optional, defaults to 'x-supabase-signature'
      },
    }),
  ],
  controllers: [AppController],
  providers: [InvitationsService],
})
export class AppModule {}
```

Now you can use the `@SupabaseEventHandler` decorator to listen for Supabase Database Webhook events in your services.

```typescript
// invitations/invitations.services.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  SupabaseEventHandler,
  SupabasePayload,
} from 'nestjs-supabase-webhooks';

@Injectable()
export class InvitationsService {
  constructor() {}

  @SupabaseEventHandler({
    type: 'INSERT',
    table: 'invitations',
  })
  async insertInvitation(event: SupabasePayload) {
    // Do something with the event, e.g. send an email
  }
}
```
