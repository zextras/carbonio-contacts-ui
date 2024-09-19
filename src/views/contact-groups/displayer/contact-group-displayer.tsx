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
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useGetMainAccountContactGroup } from '../../../hooks/useGetContactGroup';

type Props = {
	contactGroupId: string;
};
export const ContactGroupDisplayer = ({ contactGroupId }: Props): React.JSX.Element => {
	const contactGroup = useGetMainAccountContactGroup(contactGroupId);
	const replaceHistory = useReplaceHistoryCallback();
	const routeToContacts = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}`);
	}, [replaceHistory]);
	const deleteAction = useActionDeleteCG(routeToContacts);
	const editAction = useActionEditCG();
	const sendAction = useActionSendEmailCG();

	return (
		<>
			{contactGroup ? (
				<ContactGroupDisplayerActionsHeader
					contactGroup={contactGroup}
					onCloseDisplayer={routeToContacts}
					deleteAction={deleteAction}
					editAction={editAction}
					sendAction={sendAction}
				></ContactGroupDisplayerActionsHeader>
			) : (
				<ContactGroupEmptyDisplayer />
			)}
		</>
	);
};
