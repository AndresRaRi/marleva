import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HealthController } from './dist/controller.js';
import { HttpErrors } from './dist/http-errors.filter.js';
import { httpPolicy } from './dist/http-policy.js';

// Own the Nest dependency in the API workspace; the test runner owns fault injection.
export async function readinessProbe(origin) {
  class HealthOnly {}
  Module({ controllers: [HealthController] })(HealthOnly);
  const app = await NestFactory.create(HealthOnly, { logger: false });
  app.use(httpPolicy(origin));
  app.useGlobalFilters(new HttpErrors());
  await app.listen(0, '127.0.0.1');
  return app;
}
