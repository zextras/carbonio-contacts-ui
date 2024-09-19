/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { DeleteCGAction } from '../../../actions/delete-cg';
import { EditActionCG } from '../../../actions/edit-cg';
import { SendEmailActionCG } from '../../../actions/send-email-cg';
import { DisplayerActionsHeader } from '../../../components/displayer-actions-header';
import { useEvaluateContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { ContactGroup } from '../../../model/contact-group';

type Props = {
	contactGroup: ContactGroup;
	deleteAction?: DeleteCGAction;
	editAction?: EditActionCG;
	sendMailAction?: SendEmailActionCG;
};
export const ContactGroupDisplayerActionsHeader = ({
	contactGroup,
	deleteAction,
	editAction,
	sendMailAction
}: Props): React.JSX.Element => {
	const actions = useEvaluateContactGroupActions(
		contactGroup,
		deleteAction,
		sendMailAction,
		editAction
	);
	return <DisplayerActionsHeader actions={actions} />;
};
