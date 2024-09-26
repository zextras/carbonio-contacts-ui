/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupComponent } from './contact-group-component';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';

export const ContactGroupSharedAccount = ({
	accountId
}: {
	accountId: string;
}): React.JSX.Element => {
	const replaceHistory = useReplaceHistoryCallback();
	const onClick = useCallback(
		(ev: React.SyntheticEvent | KeyboardEvent) => {
			ev.preventDefault();
			replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId}`);
		},
		[replaceHistory, accountId]
	);
	return <ContactGroupComponent onClick={onClick} />;
};
