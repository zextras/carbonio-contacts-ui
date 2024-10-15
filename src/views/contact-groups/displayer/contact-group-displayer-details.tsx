/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Divider, List, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { MemberDisplayerListItemComponent } from '../../../components/member-displayer-list-item';
import { CustomIconAvatar } from '../../../components/styled-components';
import { Text } from '../../../components/Text';
import { ContactGroup } from '../../../model/contact-group';

export type CGDisplayerDetailsProps = {
	contactGroup: ContactGroup;
};

export const ContactGroupDisplayerDetails = ({
	contactGroup
}: CGDisplayerDetailsProps): React.JSX.Element => {
	const [t] = useTranslation();

	const { members, title } = contactGroup;

	const memberItems = useMemo(
		() => members.map((member) => <MemberDisplayerListItemComponent email={member} key={member} />),
		[members]
	);

	return (
		<Container
			padding={{ horizontal: '1rem', top: '1rem', bottom: '0' }}
			crossAlignment={'flex-start'}
			mainAlignment={'flex-start'}
			gap={'1rem'}
			background={'gray6'}
			minHeight={'0'}
			height={'auto'}
		>
			<Container
				height={'fit'}
				orientation={'horizontal'}
				mainAlignment={'flex-start'}
				gap={'1rem'}
			>
				<CustomIconAvatar label={title} size={'large'} icon={'PeopleOutline'} />
				<Container height={'fit'} crossAlignment={'flex-start'} minWidth={0}>
					<Text weight={'bold'}>{title}</Text>
					<Text size={'small'} color={'secondary'}>
						{t('contactGroupDisplayer.label.members_total', 'Addresses: {{count}}', {
							count: members.length
						})}
					</Text>
				</Container>
			</Container>
			<Divider color={'gray3'} />
			<Row padding={{ top: '0.5rem' }}>
				<Text color={'secondary'}>
					{t('board.newContactGroup.input.contact_input.title', 'Addresses list')}
				</Text>
			</Row>
			<Container minHeight={'0'} mainAlignment={'flex-start'}>
				<List>{memberItems}</List>
			</Container>
		</Container>
	);
};
