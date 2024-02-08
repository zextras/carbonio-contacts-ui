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
import { loadingItems } from './loading-items';
import { MemberDisplayerListItemComponent } from './member-displayer-list-item';

type MemberListProps = {
	members: Array<string>;
	membersCount: number;
	loading?: boolean;
};

export const MemberList = ({
	members,
	membersCount,
	loading
}: MemberListProps): React.JSX.Element => {
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
		<Container
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			gap={'0.5rem'}
			minHeight={0}
		>
			<Container
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
				gap={'0.25rem'}
				height={'auto'}
				minHeight={'fit-content'}
			>
				<Text size={'small'} color={'secondary'}>
					{t('displayer.distribution_list.label.member_total', 'Member list {{total}}', {
						total: membersCount
					})}
				</Text>
				<Text size={'small'} overflow={'break-word'}>
					{t(
						'displayer.distribution_list.label.filter_hint',
						'You can filter this list by looking for specific member’s name.'
					)}
				</Text>
			</Container>
			<Input
				data-testid={'dl-members-filter-input'}
				label={t('displayer.distribution_list.placeholder.filter_member', 'Filter an address')}
				CustomIcon={FilterMembersIcon}
				value={searchValue}
				onChange={onSearchChange}
			/>
			<Container minHeight={'10rem'} mainAlignment={'flex-start'}>
				<ListV2>{(!loading && memberItems) || loadingItems(3)}</ListV2>
			</Container>
		</Container>
	);
};
