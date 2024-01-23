/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DLDetailsInfo } from './dl-details-info';
import { Text } from './Text';

type DistributionListDetailsProps = {
	email: string;
	displayName?: string;
	description?: string;
};

export const DistributionListDetails = ({
	email,
	displayName,
	description
}: DistributionListDetailsProps): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<Container
			height={'auto'}
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			gap={'1rem'}
		>
			<DLDetailsInfo displayName={displayName} email={email} />
			<Divider color={'gray3'} />
			{description && (
				<Container height={'auto'} mainAlignment={'flex-start'} crossAlignment={'flex-start'}>
					<Text size={'small'} color={'secondary'}>
						{t('displayer.distribution_list.label.description', 'Description')}
					</Text>
					<Text overflow={'break-word'}>{description}</Text>
				</Container>
			)}
		</Container>
	);
};
