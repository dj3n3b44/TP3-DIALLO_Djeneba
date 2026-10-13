import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { getQuai7Case } from '@trace/core';
import type { CaseData } from '@trace/core';
import { createApp } from './app';

export function createTraceServer(caseData: CaseData = getQuai7Case()): Server {
  return createServer(createApp(caseData));
}
