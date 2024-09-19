/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ContactGroupDisplayerDetails } from './contact-group-displayer-details';
import { DeleteCGAction } from '../../../actions/delete-cg';
import { EditActionCG } from '../../../actions/edit-cg';
import { SendEmailActionCG } from '../../../actions/send-email-cg';
import { DisplayerActionsHeader } from '../../../components/displayer-actions-header';
import { DisplayerHeader } from '../../../components/displayer-header';
import { useEvaluateContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { ContactGroup } from '../../../model/contact-group';

interface Props {
	contactGroup: ContactGroup;
	onCloseDisplayer: () => void;
	deleteAction?: DeleteCGAction;
	editAction?: EditActionCG;
	sendAction?: SendEmailActionCG;
}
export const ContactGroupDisplayerActionsHeader = ({
	contactGroup,
	onCloseDisplayer,
	deleteAction,
	editAction,
	sendAction
}: Props): React.JSX.Element => {
	const actions = useEvaluateContactGroupActions(
		contactGroup,
		deleteAction,
		sendAction,
		editAction
	);
	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '3rem' }}>
			<DisplayerHeader
				title={contactGroup.title}
				icon={'PeopleOutline'}
				closeDisplayer={onCloseDisplayer}
			/>
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<DisplayerActionsHeader actions={actions} />
				<ContactGroupDisplayerDetails contactGroup={contactGroup} />
			</Container>
		</Container>
	);
};
