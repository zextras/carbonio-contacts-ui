/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { CGDisplayerDetails } from './cg-displayer-details';
import { DisplayerActionsHeader } from './diplayer-actions-header';
import { DisplayerHeader } from './displayer-header';
import { useContactGroupActions } from '../hooks/use-contact-group-actions';
import { ContactGroup } from '../model/contact-group';

interface ContactGroupDisplayerProps {
	contactGroup: ContactGroup;
}

export const CGDisplayer = ({ contactGroup }: ContactGroupDisplayerProps): React.JSX.Element => {
	const actions = useContactGroupActions(contactGroup);
	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '3rem' }}>
			<DisplayerHeader title={contactGroup.title} icon={'PeopleOutline'} />
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<DisplayerActionsHeader actions={actions} />
				<CGDisplayerDetails contactGroup={contactGroup} />
			</Container>
		</Container>
	);
};
