/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { CgListComponent } from './cg-list-component';
import { useFindContactGroups } from '../hooks/useFindContactGroups';

export const CGList = (): React.JSX.Element => {
	const { contactGroups: mainAccountContactGroups, hasMore, findMore } = useFindContactGroups();

	const replaceHistory = useReplaceHistoryCallback();
	const onListBottom = useCallback(() => (hasMore ? findMore : undefined), [hasMore, findMore]);
	const onClick = useCallback(
		(id: string) => {
			replaceHistory(`/contact-groups/${id}`);
		},
		[replaceHistory]
	);
	return (
		<CgListComponent
			onContactGroupClick={onClick}
			contactGroups={mainAccountContactGroups}
			onListBottom={onListBottom}
		></CgListComponent>
	);
};
