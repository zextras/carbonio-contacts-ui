/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { DisplayerActionsHeader } from './displayer-actions-header';
import { DisplayerHeader } from './displayer-header';
import { DistributionListDetails } from './dl-details';
import { ManagerList } from './manager-list';
import { MemberList } from './member-list';
import { ScrollableContainer } from './styled-components';
import { useDLActions } from '../hooks/use-dl-actions';
import { useGetDistributionList } from '../hooks/use-get-distribution-list';
import { useGetDistributionListMembers } from '../hooks/use-get-distribution-list-members';

interface DistributionListDisplayerProps {
	id: string;
}

export const DistributionListDisplayer = ({
	id
}: DistributionListDisplayerProps): React.JSX.Element => {
	const dlToLoad = useMemo(() => ({ id }), [id]);
	const distributionList = useGetDistributionList(dlToLoad);
	const actions = useDLActions(distributionList);
	const { members, totalMembers } = useGetDistributionListMembers(distributionList?.email ?? '');

	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '1rem' }}>
			<DisplayerHeader
				title={(distributionList?.displayName || distributionList?.email) ?? ''}
				icon={'DistributionListOutline'}
			/>
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<DisplayerActionsHeader actions={actions} />
				<ScrollableContainer mainAlignment={'flex-start'}>
					<Container
						background={'gray6'}
						padding={'1rem'}
						gap={'1rem'}
						height={'auto'}
						mainAlignment={'flex-start'}
						crossAlignment={'flex-start'}
					>
						<DistributionListDetails
							email={distributionList?.email ?? ''}
							displayName={distributionList?.displayName}
							description={distributionList?.description}
						/>
						<ManagerList managers={distributionList?.owners} />
						<MemberList members={members} membersCount={totalMembers} />
					</Container>
				</ScrollableContainer>
			</Container>
		</Container>
	);
};