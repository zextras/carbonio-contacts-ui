/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';
import { useParams } from 'react-router-dom';

import { ContactGroupListComponent } from './contact-group-list-component';
import { useFindSharedContactGroups } from '../hooks/use-find-shared-contact-groups';

export const ContactGroupListShared = (): React.JSX.Element => {
	const { accountId } = useParams<{ accountId: string }>();
	const { sharedContactGroups } = useFindSharedContactGroups(accountId);

	const replaceHistory = useReplaceHistoryCallback();

	const onClick = useCallback(
		(id: string) => {
			replaceHistory(`/contact-groups/${accountId}/${id}`);
		},
		[accountId, replaceHistory]
	);
	return (
		<ContactGroupListComponent
			onContactGroupClick={onClick}
			contactGroups={sharedContactGroups}
			onListBottom={noop}
		></ContactGroupListComponent>
	);
};
