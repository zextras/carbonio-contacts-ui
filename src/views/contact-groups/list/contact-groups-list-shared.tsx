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
import { useActionDeleteCG } from '../../../actions/delete-cg';
import { useActionEditCG } from '../../../actions/edit-cg';
import { useActionSendEmailCG } from '../../../actions/send-email-cg';
import { StyledListItem } from '../../../components/styled-components';
import { useFindSharedContactGroups } from '../../../hooks/use-find-shared-contact-groups';

export const ContactGroupListShared = (): React.JSX.Element => {
	const { accountId } = useParams<{ accountId: string }>();
	const { sharedContactGroups } = useFindSharedContactGroups(accountId);

	const replaceHistory = useReplaceHistoryCallback();
	const redirectToSharedContactGroup = useCallback(() => {
		replaceHistory(`/contact-groups/${accountId}/`);
	}, [accountId, replaceHistory]);
	const displaySharedContactGroup = useCallback(
		(id: string) => {
			replaceHistory(`/contact-groups/${accountId}/${id}`);
		},
		[accountId, replaceHistory]
	);
	const deleteAction = useActionDeleteCG(redirectToSharedContactGroup);
	const editAction = useActionEditCG();
	const sendEmailActionCG = useActionSendEmailCG();
	const items = useMemo(
		() =>
			map(sharedContactGroups, (contactGroup) => (
				<StyledListItem key={contactGroup.id} data-testid={'shared-list-item'}>
					{(visible): React.JSX.Element => (
						<ContactGroupListItem
							visible={visible}
							contactGroup={contactGroup}
							onClick={displaySharedContactGroup}
							deleteAction={deleteAction}
							editAction={editAction}
							sendAction={sendEmailActionCG}
						/>
					)}
				</StyledListItem>
			)),
		[deleteAction, displaySharedContactGroup, editAction, sendEmailActionCG, sharedContactGroups]
	);

	return (
		<ContactGroupListComponent onContactGroupClick={displaySharedContactGroup} onListBottom={noop}>
			{items}
		</ContactGroupListComponent>
	);
};
