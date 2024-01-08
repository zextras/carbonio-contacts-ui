/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ActionsHeader } from './ActionsHeader';
import { CGDisplayerDetails } from './cg-displayer-details';
import { DisplayerHeader } from './DisplayerHeader';
import { useContactGroupActions } from '../hooks/use-contact-group-actions';
import { ContactGroup } from '../model/contact-group';

interface ContactGroupDisplayerProps {
	contactGroup: ContactGroup;
}

export const ContactGroupDisplayer = ({
	contactGroup
}: ContactGroupDisplayerProps): React.JSX.Element => {
	const actions = useContactGroupActions(contactGroup);
	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '1rem' }}>
			<DisplayerHeader title={contactGroup.title} />
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<ActionsHeader actions={actions} />
				<CGDisplayerDetails
					id={contactGroup.id}
					title={contactGroup.title}
					members={contactGroup.members}
				/>
			</Container>
		</Container>
	);
};
