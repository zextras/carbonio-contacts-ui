/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NameSpace } from '@zextras/carbonio-shell-ui';

export interface GenericSoapPayload<NS extends NameSpace> {
	_jsns: NS;
	requestId?: string;
}
