/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import { useBoardHooks } from '@zextras/carbonio-shell-ui';

/**
 * Tell the shell whether the current board has unsaved changes, so that the shell asks
 * for a confirmation when the board is closed.
 * The status is optional in the shell (e.g. an older shell), so it is called with `?.()`.
 */
export const useBoardContentStatus = (isDirty: boolean): void => {
	const { setContentStatus } = useBoardHooks();

	useEffect(() => {
		setContentStatus?.(isDirty ? 'dirty' : 'pristine');
	}, [setContentStatus, isDirty]);
};
