/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DistributionListDisplayer } from './dl-displayer';
import { EmptyDisplayer } from './EmptyDisplayer';
import { useActiveItem } from '../hooks/useActiveItem';

export const Displayer = (): React.JSX.Element => {
	const { activeItem } = useActiveItem();
	const [t] = useTranslation();

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{(activeItem && <DistributionListDisplayer id={activeItem} />) || (
				<EmptyDisplayer
					icon={'DistributionListOutline'}
					title={t('displayer.title3', 'Stay in touch with your colleagues.')}
					description={t(
						'displayer.distributionList.emptyDisplayer',
						'Select a distribution list or contact the Admin to have one.'
					)}
				/>
			)}
		</Container>
	);
};
