/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupListItem } from './contact-group-list-item';
import { useEvaluateSharedContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { SharedContactGroup } from '../../../model/contact-group';

type Props = {
	contactGroup: SharedContactGroup;
	visible: boolean;
};
export const ContactGroupListItemSharedAccount = ({
	contactGroup,
	visible
}: Props): React.JSX.Element => {
	const replaceHistory = useReplaceHistoryCallback();
	const { accountId } = contactGroup;
	const displaySharedContactGroup = useCallback(
		(id: string) => {
			replaceHistory(`/contact-groups/${accountId}/${id}`);
		},
		[accountId, replaceHistory]
	);
	const actions = useEvaluateSharedContactGroupActions()(contactGroup);
	return (
		<ContactGroupListItem
			visible={visible}
			contactGroup={contactGroup}
			onClick={displaySharedContactGroup}
			actions={actions}
		/>
	);
};
