/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, ContainerProps, IconButton, Row } from '@zextras/carbonio-design-system';

import { CustomIconAvatar } from './styled-components';
import { Text } from './Text';
import { useActionCopyToClipboard } from '../actions/copy-to-clipboard';
import { DistributionList } from '../model/distribution-list';

export const DLDetailsInfo = ({
	displayName,
	email,
	...rest
}: Pick<DistributionList, 'displayName' | 'email'> & ContainerProps): React.JSX.Element => {
	const copyToClipboardAction = useActionCopyToClipboard();

	const copyEmail = useCallback(() => {
		copyToClipboardAction.execute(email);
	}, [copyToClipboardAction, email]);

	return (
		<Container
			orientation={'horizontal'}
			gap={'1rem'}
			mainAlignment={'flex-start'}
			crossAlignment={'flex-start'}
			height={'auto'}
			data-testid={'info-container'}
			{...rest}
		>
			<CustomIconAvatar
				shape={'square'}
				icon={'DistributionListOutline'}
				label={displayName || email}
				size={'large'}
			/>
			<Container minWidth={0} crossAlignment={'flex-start'} mainAlignment={'center'}>
				<Text weight={'bold'}>{displayName}</Text>
				<Row gap={'0.25rem'}>
					<Text
						size={displayName ? 'small' : 'medium'}
						weight={displayName ? 'regular' : 'bold'}
						color={displayName ? 'gray1' : 'text'}
					>
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
	);
};
