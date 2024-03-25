/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Text, Divider } from '@zextras/carbonio-design-system';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getFolderTranslatedNameByName } from '../../utils/helpers';

export function Breadcrumbs({ folderPath, itemsCount }) {
	const [t] = useTranslation();
	const label = useMemo(
		() =>
			folderPath
				?.split('/')
				?.map((token) => getFolderTranslatedNameByName(t, token))
				.join(' / '),
		[t, folderPath]
	);

	return (
		<>
			<Container
				background="gray5"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="3rem"
			>
				<Row
					height="100%"
					width="fill"
					padding={{ all: 'small' }}
					mainAlignment="space-between"
					takeAvailableSpace
				>
					<Row
						mainAlignment="flex-start"
						takeAvailableSpace
						padding={{ all: 'small', right: 'medium' }}
					>
						<Text size="medium" data-testid="BreadcrumbPath">
							{label}
						</Text>
					</Row>
					<Row mainAlignment="flex-end" padding={{ all: 'small', right: 'medium' }}>
						<Text size="extrasmall" data-testid="BreadcrumbCount">
							{itemsCount > 99 ? ("100+") : (itemsCount) }
						</Text>
					</Row>
				</Row>
			</Container>
			<Divider />
		</>
	);
}
