/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { ContactGroupListComponent } from './contact-group-list-component';
import { ContactGroupListItem } from './contact-group-list-item';
import { useActionDeleteMainAccountContactGroup } from '../../../actions/delete-cg';
import { useActionEditCG } from '../../../actions/edit-cg';
import { useActionSendEmailCG } from '../../../actions/send-email-cg';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { StyledListItem } from '../../../components/styled-components';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useFindContactGroups } from '../../../hooks/useFindContactGroups';

export const ContactGroupListMainAccount = (): React.JSX.Element => {
	const { contactGroups: mainAccountContactGroups, hasMore, findMore } = useFindContactGroups();

	const replaceHistory = useReplaceHistoryCallback();
	const onListBottom = useCallback(() => (hasMore ? findMore : undefined), [hasMore, findMore]);
	const displayContact = useCallback(
		(id: string) => {
			replaceHistory(`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}/${id}`);
		},
		[replaceHistory]
	);
	const redirectToMainAccountContactGroups = useCallback(() => {
		replaceHistory(`/contact-groups/7/`);
	}, [replaceHistory]);
	const deleteAction = useActionDeleteMainAccountContactGroup(redirectToMainAccountContactGroups);
	const editAction = useActionEditCG();
	const sendEmailActionCG = useActionSendEmailCG();
	const items = useMemo(
		() =>
			map(mainAccountContactGroups, (contactGroup) => (
				<StyledListItem key={contactGroup.id} data-testid={'shared-list-item'}>
					{(visible): React.JSX.Element => (
						<ContactGroupListItem
							visible={visible}
							contactGroup={contactGroup}
							onClick={displayContact}
							deleteAction={deleteAction}
							editAction={editAction}
							sendAction={sendEmailActionCG}
						/>
					)}
				</StyledListItem>
			)),
		[deleteAction, displayContact, editAction, sendEmailActionCG, mainAccountContactGroups]
	);

	return (
		<ContactGroupListComponent onContactGroupClick={displayContact} onListBottom={onListBottom}>
			{items}
		</ContactGroupListComponent>
	);
};
