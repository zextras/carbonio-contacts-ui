/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container, ListV2, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MemberDisplayerListItemComponent } from './member-displayer-list-item';

type ManagerListProps = {
	managers: Array<{ id: string; name: string }>;
};

export const ManagerList = ({ managers }: ManagerListProps): React.JSX.Element => {
	const [t] = useTranslation();

	const memberItems = useMemo(
		() =>
			map<{ id: string; name: string }, React.JSX.Element>(managers, (manager) => (
				<MemberDisplayerListItemComponent email={manager.name} key={manager.id} />
			)),
		[managers]
	);

	return (
		<Container mainAlignment={'flex-start'} crossAlignment={'flex-start'} gap={'0.5rem'}>
			<Text size={'small'} color={'secondary'}>
				{t('displayer.distributionList.label.manager_total', 'Manager list {{total}}', {
					total: managers.length
				})}
			</Text>
			<Container height={'15rem'}>
				<ListV2 maxWidth={'fill'}>{memberItems}</ListV2>
			</Container>
		</Container>
	);
};
