/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupListComponent } from './contact-group-list-component';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useFindContactGroups } from '../../../hooks/useFindContactGroups';

export const ContactGroupListMainAccount = (): React.JSX.Element => {
	const { contactGroups: mainAccountContactGroups, hasMore, findMore } = useFindContactGroups();

	const replaceHistory = useReplaceHistoryCallback();
	const onListBottom = useCallback(() => (hasMore ? findMore : undefined), [hasMore, findMore]);
	const onClick = useCallback(
		(id: string) => {
			replaceHistory(`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}/${id}`);
		},
		[replaceHistory]
	);
	return (
		<ContactGroupListComponent
			onContactGroupClick={onClick}
			contactGroups={mainAccountContactGroups}
			onListBottom={onListBottom}
		></ContactGroupListComponent>
	);
};
