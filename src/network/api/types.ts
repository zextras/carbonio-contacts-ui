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

export type CnItem = {
	id: string;
	l: string;
	d: number;
	rev: number;
	fileAsStr: string;
	_attrs: { fullName?: string; nickname?: string; type: string; fileAs: string };
	m: Array<{ type: 'I'; value: string }>;
	sf?: string;
};
