/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { CGDisplayerActionsHeader } from './cg-displayer-actions-header';
import { CGDisplayerDetails } from './cg-displayer-details';
import { CGDisplayerHeader } from './cg-displayer-header';
import { useContactGroupActions } from '../hooks/use-contact-group-actions';
import { ContactGroup } from '../model/contact-group';

interface ContactGroupDisplayerProps {
	contactGroup: ContactGroup;
}

export const CGDisplayer = ({ contactGroup }: ContactGroupDisplayerProps): React.JSX.Element => {
	const actions = useContactGroupActions(contactGroup);
	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '1rem' }}>
			<CGDisplayerHeader title={contactGroup.title} />
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<CGDisplayerActionsHeader actions={actions} />
				<CGDisplayerDetails
					id={contactGroup.id}
					title={contactGroup.title}
					members={contactGroup.members}
				/>
			</Container>
		</Container>
	);
};
