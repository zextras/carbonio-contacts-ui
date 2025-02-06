/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useMemo } from 'react';

import { Action, Container } from '@zextras/carbonio-design-system';

import { ContactGroupDisplayerDetails } from './contact-group-displayer-details';
import { ContactGroupEmptyDisplayer } from './contact-group-empty-displayer';
import { ActionIconButton } from '../../../components/action-icon-button';
import { DisplayerActionsHeader } from '../../../components/displayer-actions-header';
import { DisplayerHeader } from '../../../components/displayer-header';
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
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{contactGroup ? (
				<Container
					background={'gray5'}
					mainAlignment={'flex-start'}
					padding={{ bottom: '3rem' }}
					data-testid={'contact-group-displayer'}
				>
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
						<DisplayerActionsHeader>{actionButtons}</DisplayerActionsHeader>
						<ContactGroupDisplayerDetails contactGroup={contactGroup} />
					</Container>
				</Container>
			) : (
				<ContactGroupEmptyDisplayer />
			)}
		</Container>
	);
};
