/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { QueryChip } from '@zextras/carbonio-search-ui';

export type Query = Array<
	QueryChip & {
		isGeneric?: boolean;
		isQueryFilter?: boolean;
	}
>;
