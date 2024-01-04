/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Container, Text, Accordion } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const ContainerEl = styled(Container)`
	overflow-y: auto;
	display: block;
`;

const FolderItem = ({ folders }) => {
	const [t] = useTranslation();
	return folders.length ? (
		<ContainerEl
			orientation="vertical"
			mainAlignment="flex-start"
			minHeight="30vh"
			maxHeight="60vh"
		>
			<Accordion items={folders} background="gray6" />
		</ContainerEl>
	) : (
		<Container padding={{ all: 'small' }}>
			<Text size="large"> {t('folder.modal.item.empty', 'No items available')} </Text>
		</Container>
	);
};

export default FolderItem;
