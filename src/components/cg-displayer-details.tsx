/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Avatar, Container, ListV2, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { MemberDisplayerListItemComponent } from './member-displayer-list-item';

export type CGDisplayerDetailsProps = {
	id: string;
	title: string;
	members: Array<string>;
};

export const CGDisplayerDetails = ({
	id,
	title,
	members
}: CGDisplayerDetailsProps): React.JSX.Element => {
	const [t] = useTranslation();

	const memberItems = useMemo(
		() => members.map((member) => <MemberDisplayerListItemComponent email={member} key={member} />),
		[members]
	);

	return (
		<>
			<Container gap={'1rem'}>
				<Row>
					<Avatar label={''} size={'large'} icon={'PeopleOutline'} />
					<Container gap={'0.5rem'}>
						<Text weight="bold">{title}</Text>
						<Text size={'small'} color={'secondary'}>
							{t('cg_displayer.label.members_total', 'Addresses: {{count}}', {
								count: members.length
							})}
						</Text>
					</Container>
				</Row>
			</Container>
			<Container height={'15rem'}>
				<ListV2 maxWidth={'fill'}>{memberItems}</ListV2>
			</Container>
		</>
	);
};
