/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Avatar, Container, Divider, IconButton, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ScrollableContainer } from './StyledComponents';
import { Text } from './Text';
import { useActionCopyToClipboard } from '../actions/copy-to-clipboard';

type DistributionListDetailsProps = {
	id: string;
	email: string;
	displayName?: string;
	description?: string;
};

export const DistributionListDetails = ({
	id,
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
		<ScrollableContainer mainAlignment={'flex-start'}>
			<Container
				background={'gray6'}
				padding={'1rem'}
				gap={'1rem'}
				height={'auto'}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
			>
				<Container orientation={'horizontal'} gap={'1rem'} mainAlignment={'flex-start'}>
					<Avatar shape={'square'} icon={'DistributionListOutline'} label={displayName || email} />
					<Container minWidth={0} crossAlignment={'flex-start'}>
						<Text size={'small'} weight={'bold'}>
							{displayName}
						</Text>
						<Row gap={'0.25rem'}>
							<Text size={'small'}>{email}</Text>
							<IconButton icon={copyToClipboardAction.icon} color={'primary'} onClick={copyEmail} />
						</Row>
					</Container>
				</Container>
				<Divider color={'gray3'} />
				{description && (
					<Container height={'auto'}>
						<Text size={'small'} color={'secondary'}>
							{t('displayer.distributionLists.label.description', 'Description')}
						</Text>
						<Text>{description}</Text>
					</Container>
				)}
			</Container>
		</ScrollableContainer>
	);
};
