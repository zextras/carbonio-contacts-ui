/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ContactGroupDisplayerController } from '../components/contact-group-displayer-controller';
import { ContactGroupsList } from '../components/ContactGroupsList';
import { DISPLAYER_WIDTH } from '../constants';
import { useFindContactGroups } from '../hooks/useFindContactGroups';

export const ContactGroupsView = (): React.JSX.Element => {
	const { contactGroups, hasMore, findMore } = useFindContactGroups();

	return (
		<Container
			orientation="row"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="fill"
			height="fill"
			background="gray5"
			borderRadius="none"
			maxHeight="100%"
		>
			<ContactGroupsList
				contactGroups={contactGroups}
				onListBottom={hasMore ? findMore : undefined}
			/>
			<Container
				width={DISPLAYER_WIDTH}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				borderRadius="none"
				style={{ maxHeight: '100%' }}
			>
				<ContactGroupDisplayerController />
			</Container>
		</Container>
	);
};
