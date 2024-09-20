/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { map, noop } from 'lodash';
import { useParams } from 'react-router-dom';

import { ContactGroupListComponent } from './contact-group-list-component';
import { ContactGroupListItem } from './contact-group-list-item';
import { StyledListItem } from '../../../components/styled-components';
import { useEvaluateSharedContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { useFindSharedContactGroups } from '../../../hooks/use-find-shared-contact-groups';

export const ContactGroupListShared = (): React.JSX.Element => {
	const { accountId } = useParams<{ accountId: string }>();
	const { sharedContactGroups } = useFindSharedContactGroups(accountId);

	const replaceHistory = useReplaceHistoryCallback();
	const displaySharedContactGroup = useCallback(
		(id: string) => {
			replaceHistory(`/contact-groups/${accountId}/${id}`);
		},
		[accountId, replaceHistory]
	);
	const actions = useEvaluateSharedContactGroupActions();
	const items = useMemo(
		() =>
			map(sharedContactGroups, (contactGroup) => (
				<StyledListItem key={contactGroup.id} data-testid={'shared-list-item'}>
					{(visible): React.JSX.Element => (
						<ContactGroupListItem
							visible={visible}
							contactGroup={contactGroup}
							onClick={displaySharedContactGroup}
							actions={actions}
						/>
					)}
				</StyledListItem>
			)),
		[actions, displaySharedContactGroup, sharedContactGroups]
	);

	return (
		<ContactGroupListComponent onContactGroupClick={displaySharedContactGroup} onListBottom={noop}>
			{items}
		</ContactGroupListComponent>
	);
};
