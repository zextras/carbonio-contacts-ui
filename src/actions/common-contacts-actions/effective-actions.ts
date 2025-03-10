/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Action as DSAction } from '@zextras/carbonio-design-system';

import { UIAction } from '../types';

// returns a list of DSAction that can be executed
export function toEffectiveActions(actions: Array<UIAction<void, void>>): Array<DSAction> {
	const effectiveActions: Array<DSAction> = [];
	actions.forEach((action) => {
		if (action.canExecute()) {
			effectiveActions.push({
				id: action.id,
				label: action.label,
				onClick: (): void => {
					action.execute();
				},
				disabled: action.disabled,
				icon: action.icon,
				color: action.color
			});
		}
	});
	return effectiveActions;
}
