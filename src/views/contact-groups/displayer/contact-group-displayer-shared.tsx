/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupDisplayerActionsHeader } from './contact-group-displayer-actions-header';
import { ContactGroupEmptyDisplayer } from './contact-group-empty-displayer';
import { useActionDeleteCG } from '../../../actions/delete-cg';
import { useActionEditCG } from '../../../actions/edit-cg';
import { useActionSendEmailCG } from '../../../actions/send-email-cg';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useGetSharedAccountContactGroup } from '../../../hooks/useGetContactGroup';

interface ContactGroupSharedDisplayerProps {
	accountId: string;
	contactGroupId: string;
}

export const ContactGroupDisplayerShared = ({
	accountId,
	contactGroupId
}: ContactGroupSharedDisplayerProps): React.JSX.Element => {
	const contactGroup = useGetSharedAccountContactGroup(accountId, contactGroupId);
	const replaceHistory = useReplaceHistoryCallback();
	const routeToContactGroups = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId}`);
	}, [accountId, replaceHistory]);
	const deleteAction = useActionDeleteCG(routeToContactGroups);
	const editAction = useActionEditCG();
	const sendAction = useActionSendEmailCG();

	return (
		<>
			{contactGroup ? (
				<ContactGroupDisplayerActionsHeader
					contactGroup={contactGroup}
					onCloseDisplayer={routeToContactGroups}
					deleteAction={deleteAction}
					editAction={editAction}
					sendAction={sendAction}
				/>
			) : (
				<ContactGroupEmptyDisplayer />
			)}
		</>
	);
};
