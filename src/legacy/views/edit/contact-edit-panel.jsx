/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import {
	Container,
	Divider,
	Icon,
	IconButton,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import EditView from './edit-view';

function ContactEditHeader({ editPanelId, folderId }) {
	const [t] = useTranslation();

	const onClose = useCallback(() => replaceHistory(`/folder/${folderId}`), [folderId]);

	return (
		<Container height="3.0625rem">
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				height="3rem"
				padding={{ left: 'large', right: 'large' }}
			>
				<Padding right="medium">
					<Icon size="medium" icon="EditOutline" />
				</Padding>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium">
						{editPanelId && editPanelId !== 'new'
							? t('label.edit', 'Edit')
							: t('label.create', 'Create')}
					</Text>
				</Row>
				<IconButton icon="Close" size="small" onClick={onClose} />
			</Container>
			<Divider />
		</Container>
	);
}

export default function ContactEditPanel() {
	const { editId, folderId } = useParams();
	return (
		<>
			<ContactEditHeader editPanelId={editId} folderId={folderId} />
			<Container height="fit" style={{ maxHeight: '100%', overflowY: 'auto' }}>
				<EditView panel editPanelId={editId} folderId={folderId} />
			</Container>
		</>
	);
}
