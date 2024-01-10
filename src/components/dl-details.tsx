/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Avatar, Container, Divider, IconButton, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Text } from './Text';
import { useActionCopyToClipboard } from '../actions/copy-to-clipboard';

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
	const copyToClipboardAction = useActionCopyToClipboard();

	const copyEmail = useCallback(() => {
		copyToClipboardAction.execute(email);
	}, [copyToClipboardAction, email]);

	return (
		<Container
			height={'auto'}
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			gap={'1rem'}
		>
			<Container
				orientation={'horizontal'}
				gap={'1rem'}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
			>
				<Avatar
					shape={'square'}
					icon={'DistributionListOutline'}
					label={displayName || email}
					size={'large'}
				/>
				<Container minWidth={0} crossAlignment={'flex-start'} mainAlignment={'center'}>
					<Text size={'small'} weight={'bold'}>
						{displayName}
					</Text>
					<Row gap={'0.25rem'}>
						<Text size={'small'} weight={displayName ? 'regular' : 'bold'}>
							{email}
						</Text>
						<IconButton
							icon={copyToClipboardAction.icon}
							color={'primary'}
							onClick={copyEmail}
							type={'ghost'}
						/>
					</Row>
				</Container>
			</Container>
			<Divider color={'gray3'} />
			{description && (
				<Container height={'auto'} mainAlignment={'flex-start'} crossAlignment={'flex-start'}>
					<Text size={'small'} color={'secondary'}>
						{t('displayer.distributionLists.label.description', 'Description')}
					</Text>
					<Text overflow={'break-word'}>{description}</Text>
				</Container>
			)}
		</Container>
	);
};
