/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { useActions } from '../hooks/useActions';

interface ContactGroupDisplayerProps {
	contactGroup: any;
}
export const ContactGroupDisplayer = ({
	contactGroup
}: ContactGroupDisplayerProps): React.JSX.Element => {
	const actions = useActions(contactGroup);
	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '1rem' }}>
			{/* <DisplayerHeader title={contactGroup.title} /> */}
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				{/* <ActionsHeader actions={actions} /> */}
			</Container>
		</Container>
	);
};
