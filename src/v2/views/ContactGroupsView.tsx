/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ContactGroupsList, ContactGroupsListProps } from '../components/ContactGroupsList';
import { DISPLAYER_WIDTH } from '../constants';
import { client } from '../network/client';

export const ContactGroupsView = (): React.JSX.Element => {
	const [contactGroups, setContactGroups] = useState<ContactGroupsListProps['contactGroups']>([]);

	useEffect(() => {
		client.findContactGroups().then((result) => {
			setContactGroups(result);
		});
	}, []);

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
			<ContactGroupsList contactGroups={contactGroups} />
			<Container
				width={DISPLAYER_WIDTH}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				borderRadius="none"
				style={{ maxHeight: '100%' }}
			>
				{/* <Displayer /> */}
			</Container>
		</Container>
	);
};
