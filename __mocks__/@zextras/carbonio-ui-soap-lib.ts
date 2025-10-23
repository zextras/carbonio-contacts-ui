/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as soapLib from '@zextras/carbonio-ui-soap-lib';
import { Mock, vi } from 'vitest';

import { getSoapFetch } from '@test-utils/network/fetch';

export const useSync: Mock<typeof soapLib.useSync> = vi.fn(() => []);
export const useInfoRefresh: Mock<typeof soapLib.useInfoRefresh> = vi.fn();
export const legacySoapFetch = getSoapFetch('test-environment');
