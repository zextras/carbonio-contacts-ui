/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DistributionListDisplayer } from './dl-displayer';
import { EmptyDisplayer } from './empty-displayer';
import { useGetDistributionList } from '../hooks/use-get-distribution-list';
import { useGetDistributionListMembers } from '../hooks/use-get-distribution-list-members';
import { useActiveItem } from '../hooks/useActiveItem';

export const DLDisplayerController = (): React.JSX.Element => {
	const { activeItem } = useActiveItem();
	const [t] = useTranslation();
	const dlToLoad = useMemo<Parameters<typeof useGetDistributionList>[0] | undefined>(
		() => (activeItem ? { id: activeItem } : undefined),
		[activeItem]
	);
	const distributionList = useGetDistributionList(dlToLoad);
	const { members, totalMembers } = useGetDistributionListMembers(
		distributionList?.canRequireMembers ? distributionList?.email ?? '' : ''
	);

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{(activeItem && (
				<DistributionListDisplayer
					members={members}
					totalMembers={totalMembers}
					distributionList={distributionList}
					showMembersList={distributionList?.canRequireMembers ?? false}
				/>
			)) || (
				<EmptyDisplayer
					icon={'DistributionListOutline'}
					title={t('displayer.title3', 'Stay in touch with your colleagues.')}
					description={t(
						'displayer.distribution_list.empty_displayer',
						'Select a distribution list or contact the Admin to have one.'
					)}
				/>
			)}
		</Container>
	);
};