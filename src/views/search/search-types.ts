/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { QueryChip } from '@zextras/carbonio-shell-ui';

export type Query = Array<
	QueryChip & {
		label?: string;
		value?: string;
		isGeneric?: boolean;
		isQueryFilter?: boolean;
	}
>;
