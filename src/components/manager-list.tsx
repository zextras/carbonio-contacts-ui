/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container, List, Row } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { loadingItems } from './loading-items';
import { MemberDisplayerListItemComponent } from './member-displayer-list-item';
import { Text } from './Text';
import { DistributionList, DistributionListOwner } from '../model/distribution-list';

type ManagerListProps = {
	managers: DistributionList['owners'];
	loading?: boolean;
};

export const ManagerList = ({ managers, loading }: ManagerListProps): React.JSX.Element => {
	const [t] = useTranslation();

	const memberItems = useMemo(
		() =>
			map<DistributionListOwner, React.JSX.Element>(managers, (manager) => (
				<MemberDisplayerListItemComponent email={manager.name} key={manager.id} />
			)),
		[managers]
	);

	return (
		<Container mainAlignment={'flex-start'} crossAlignment={'flex-start'} gap={'0.5rem'}>
			<Row>
				<Text size={'small'} color={'secondary'}>
					{t('displayer.distribution_list.label.manager_total', 'Manager list {{total}}', {
						total: managers?.length ?? 0
					})}
				</Text>
			</Row>
			<Container minHeight={0} mainAlignment={'flex-start'}>
				<List>{(!loading && memberItems) || loadingItems(3)}</List>
			</Container>
		</Container>
	);
};
