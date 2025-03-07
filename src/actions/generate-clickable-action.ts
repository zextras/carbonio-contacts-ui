/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SyntheticEvent } from 'react';

import type { Action as DSAction } from '@zextras/carbonio-design-system';
import { getAction } from '@zextras/carbonio-shell-ui';

type InternalAction = NonNullable<ReturnType<typeof getAction>[0]> & { id: string };
export const generateClickableAction = (action: InternalAction, params: unknown): DSAction => ({
	id: action.id,
	icon: action.icon,
	label: action.label,
	onClick: (ev: SyntheticEvent | KeyboardEvent): void => {
		if (ev) {
			ev.preventDefault();
		}
		action.execute(params);
	}
});
