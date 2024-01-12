/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { DLDisplayerController } from '../components/dl-displayer-controller';
import { DLListItem } from '../components/dl-list-item';
import { MainList } from '../components/main-list';
import { StyledListItem } from '../components/styled-components';
import { DISPLAYER_WIDTH, RouteParams, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useFindDistributionLists } from '../hooks/use-find-distribution-lists';
import { useActiveItem } from '../hooks/useActiveItem';

export const DistributionListsView = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { activeItem, setActive } = useActiveItem();
	const { filter } = useParams<RouteParams>();
	const distributionLists = useFindDistributionLists({
		ownerOf: filter === ROUTES_INTERNAL_PARAMS.filter.manager,
		memberOf: filter === ROUTES_INTERNAL_PARAMS.filter.member
	});

	const items = useMemo(
		() =>
			distributionLists.map((dl) => (
				<StyledListItem key={dl.id} active={dl.id === activeItem} data-testid={'list-item'}>
					{(visible): React.JSX.Element => (
						<DLListItem visible={visible} distributionList={dl} onClick={setActive} />
					)}
				</StyledListItem>
			)),
		[activeItem, distributionLists, setActive]
	);

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
			<MainList
				emptyMessage={t(
					'distribution_list.label.empty_message',
					'There are no distribution lists yet.'
				)}
			>
				{items}
			</MainList>
			<Container
				width={DISPLAYER_WIDTH}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				borderRadius="none"
				maxHeight={'100%'}
			>
				<DLDisplayerController />
			</Container>
		</Container>
	);
};
