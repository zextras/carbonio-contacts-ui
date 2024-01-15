/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { DisplayerActionsHeader } from './displayer-actions-header';
import { DisplayerHeader } from './displayer-header';
import { DistributionListDetails } from './dl-details';
import { ManagerList } from './manager-list';
import { MemberList } from './member-list';
import { ScrollableContainer } from './styled-components';
import { useDLActions } from '../hooks/use-dl-actions';
import { DistributionList } from '../model/distribution-list';

interface DistributionListDisplayerProps {
	members: Array<string>;
	totalMembers: number;
	distributionList: DistributionList | undefined;
	showMembersList: boolean;
}

export const DistributionListDisplayer = ({
	members,
	totalMembers,
	distributionList,
	showMembersList
}: DistributionListDisplayerProps): React.JSX.Element => {
	const actions = useDLActions(distributionList);

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
						{showMembersList && <MemberList members={members} membersCount={totalMembers} />}
					</Container>
				</ScrollableContainer>
			</Container>
		</Container>
	);
};
