/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react';

import { Container, Input, ListV2, Text } from '@zextras/carbonio-design-system';
import { filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { FilterMembersIcon } from './filter-members-icon';
import { MemberDisplayerListItemComponent } from './member-displayer-list-item';

type MemberListProps = {
	members: Array<string>;
	membersCount: number;
};

export const MemberList = ({ members, membersCount }: MemberListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [searchValue, setSearchValue] = useState('');

	const memberItems = useMemo(
		() =>
			map<string, React.JSX.Element>(
				filter(members, (member) => member.includes(searchValue)),
				(member) => <MemberDisplayerListItemComponent email={member} key={member} />
			),
		[members, searchValue]
	);

	const onSearchChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
		setSearchValue(event.currentTarget.value);
	}, []);

	return (
		<Container mainAlignment={'flex-start'} crossAlignment={'flex-start'} gap={'0.5rem'}>
			<Text size={'small'} color={'secondary'}>
				{t('displayer.distributionList.label.member_total', 'Member list {{total}}', {
					total: membersCount
				})}
			</Text>
			<Text size={'small'} overflow={'break-word'}>
				{t(
					'displayer.distributionList.label.filterHint',
					'You can filter this list by looking for specific member’s name.'
				)}
			</Text>
			<Input
				data-testid={'dl-members-filter-input'}
				label={t('displayer.distributionList.placeholder.filter_member', 'Filter an address')}
				CustomIcon={FilterMembersIcon}
				value={searchValue}
				onChange={onSearchChange}
			/>
			<Container height={'auto'} maxHeight={'15rem'}>
				<ListV2 maxWidth={'fill'}>{memberItems}</ListV2>
			</Container>
		</Container>
	);
};
