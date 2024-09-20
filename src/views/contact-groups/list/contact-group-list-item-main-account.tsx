/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupListItem } from './contact-group-list-item';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useEvaluateMainAccountContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { ContactGroup } from '../../../model/contact-group';

type Props = {
	contactGroup: ContactGroup;
	visible: boolean;
};
export const ContactGroupListItemMainAccount = ({
	contactGroup,
	visible
}: Props): React.JSX.Element => {
	const replaceHistory = useReplaceHistoryCallback();
	const displayContact = useCallback(
		(id: string) => {
			replaceHistory(`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}/${id}`);
		},
		[replaceHistory]
	);

	const actions = useEvaluateMainAccountContactGroupActions()(contactGroup);
	return (
		<ContactGroupListItem
			visible={visible}
			contactGroup={contactGroup}
			onClick={displayContact}
			actions={actions}
		/>
	);
};
