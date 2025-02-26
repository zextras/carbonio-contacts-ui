/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useMemo } from 'react';

import { Action } from '@zextras/carbonio-design-system';

import { ContactGroupDisplayerDetails } from './contact-group-displayer-details';
import { ContactGroupEmptyDisplayer } from './contact-group-empty-displayer';
import { ActionIconButton } from '../../../components/action-icon-button';
import { Displayer } from '../../../components/displayer/displayer';
import { DisplayerActionsHeader } from '../../../components/displayer-actions-header';
import { ContactGroup } from '../../../model/contact-group';

interface Props {
	contactGroup: ContactGroup | undefined;
	onCloseDisplayer: () => void;
	actionEvaluator: () => Action[];
}
export const ContactGroupDisplayerComponent = ({
	contactGroup,
	onCloseDisplayer,
	actionEvaluator
}: Props): React.JSX.Element => {
	const actions = actionEvaluator();
	const actionButtons = useMemo<ReactNode[]>(
		() => actions.map((action) => <ActionIconButton action={action} key={action.id} />),
		[actions]
	);
	return (
		<>
			{contactGroup ? (
				<Displayer title={contactGroup.title} icon={'PeopleOutline'} onClose={onCloseDisplayer}>
					<DisplayerActionsHeader>{actionButtons}</DisplayerActionsHeader>
					<ContactGroupDisplayerDetails contactGroup={contactGroup} />
				</Displayer>
			) : (
				<ContactGroupEmptyDisplayer />
			)}
		</>
	);
};
