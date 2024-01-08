/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ActionsHeader } from './ActionsHeader';
import { DisplayerHeader } from './DisplayerHeader';
import { useDLActions } from '../hooks/use-dl-actions';
import { useGetDistributionList } from '../hooks/use-get-distribution-list';

interface DistributionListDisplayerProps {
	id: string;
}
export const DistributionListDisplayer = ({
	id
}: DistributionListDisplayerProps): React.JSX.Element => {
	const dlToLoad = useMemo(() => ({ id }), [id]);
	const distributionList = useGetDistributionList(dlToLoad);
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
				<ActionsHeader actions={actions} />
				{/*	<ContactGroupDetails /> */}
			</Container>
		</Container>
	);
};
