/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container, Divider, Row, TabBar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DisplayerActionsHeader } from './displayer-actions-header';
import { DisplayerHeader } from './displayer-header';
import { DLDetailsInfo } from './dl-details-info';
import { ManagerList } from './manager-list';
import { MemberList } from './member-list';
import { ScrollableContainer } from './styled-components';
import { Text } from './Text';
import { DL_TABS } from '../constants';
import { useDLActions } from '../hooks/use-dl-actions';
import { useDLTabs } from '../hooks/use-dl-tabs';
import { DistributionList } from '../model/distribution-list';

interface DistributionListDisplayerProps {
	members: Array<string>;
	totalMembers: number;
	distributionList?: DistributionList;
}

export const DistributionListDisplayer = ({
	members,
	totalMembers,
	distributionList
}: DistributionListDisplayerProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { items, onChange, selected } = useDLTabs();
	const dlWithMembers = useMemo(
		(): DistributionList | undefined =>
			distributionList && {
				...distributionList,
				members: { members, total: totalMembers, more: false }
			},
		[distributionList, members, totalMembers]
	);
	const actions = useDLActions(dlWithMembers);

	return (
		<Container
			background={'gray5'}
			mainAlignment={'flex-start'}
			padding={{ bottom: '1rem' }}
			maxHeight={'100%'}
			minHeight={0}
		>
			<DisplayerHeader
				title={(distributionList?.displayName || distributionList?.email) ?? ''}
				icon={'DistributionListOutline'}
			/>
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				maxHeight={'100%'}
				minHeight={0}
			>
				<DisplayerActionsHeader actions={actions} />
				<Container
					background={'gray6'}
					padding={'1rem'}
					gap={'1rem'}
					mainAlignment={'flex-start'}
					crossAlignment={'flex-start'}
					height={'auto'}
					flexGrow={1}
					flexShrink={1}
					minHeight={0}
					maxHeight={'100%'}
				>
					<DLDetailsInfo
						displayName={distributionList?.displayName}
						email={distributionList?.email ?? ''}
					/>
					<Divider color={'gray3'} />
					<TabBar
						items={items}
						selected={selected}
						onChange={onChange}
						background={'gray6'}
						flexShrink={0}
						height={'3rem'}
						width={'fill'}
						borderColor={{ bottom: 'gray3' }}
					/>
					<Container
						padding={{ top: 'large' }}
						mainAlignment={'flex-start'}
						crossAlignment={'flex-start'}
						maxHeight={'100%'}
						minHeight={0}
					>
						{selected === DL_TABS.details && (
							<ScrollableContainer
								height={'auto'}
								mainAlignment={'flex-start'}
								crossAlignment={'flex-start'}
								maxHeight={'100%'}
								minHeight={0}
							>
								{(distributionList?.description && (
									<>
										<Text size={'small'} color={'secondary'}>
											{t('displayer.distribution_list.label.description', 'Description')}
										</Text>
										<Text overflow={'break-word'}>{distributionList.description}</Text>
									</>
								)) || (
									<Row width={'fill'}>
										<Text
											overflow={'break-word'}
											size={'small'}
											color={'secondary'}
											weight={'light'}
										>
											{t(
												'displayer.distribution_list.no_details',
												'There are no additional details for this distribution list. For more information, ask to the administrator.'
											)}
										</Text>
									</Row>
								)}
							</ScrollableContainer>
						)}

						{selected === DL_TABS.managers && <ManagerList managers={distributionList?.owners} />}
						{selected === DL_TABS.members &&
							((distributionList?.canRequireMembers && (
								<MemberList
									members={members}
									membersCount={totalMembers}
									key={distributionList.email}
								/>
							)) || (
								<Row width={'fill'}>
									<Text overflow={'break-word'} size={'small'} color={'secondary'} weight={'light'}>
										{t(
											'displayer.distribution_list.member_not_visible',
											"You don't have the permissions to see the members of this distribution list. For more information, ask to the administrator."
										)}
									</Text>
								</Row>
							))}
					</Container>
				</Container>
			</Container>
		</Container>
	);
};
