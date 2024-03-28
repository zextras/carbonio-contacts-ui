/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	Container,
	Divider,
	Icon,
	IconButton,
	Padding,
	Text,
	Row,
	Dropdown,
	Responsive
} from '@zextras/carbonio-design-system';

const ContactPreviewHeader = ({ displayName, onClose, onEdit, onDelete, onMove }) => (
	<Container height="3.0625rem">
		<Responsive mode="desktop" target={window.top}>
			<Container
				data-testid="contact-preview-header-desktop"
				orientation="horizontal"
				mainAlignment="flex-start"
				height="3rem"
				padding={{ left: 'large', right: 'large' }}
			>
				<Padding right="medium">
					<Icon size="medium" icon="PeopleOutline" />
				</Padding>

				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium">{displayName}</Text>
				</Row>
				<IconButton icon="Close" size="small" onClick={onClose} />
			</Container>
		</Responsive>

		<Responsive mode="mobile" target={window.top}>
			<Container
				orientation="horizontal"
				data-testid="contact-preview-header-mobile"
				mainAlignment="flex-start"
				height="3rem"
				padding={{ left: 'large' }}
			>
				<Padding right="medium">
					<Icon size="medium" icon="ArrowBackOutline" onClick={onClose} />
				</Padding>

				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium">{displayName}</Text>
				</Row>
				<Dropdown
					data-testid={`preview-header-dropdown-mobile`}
					items={[
						{
							id: 'edit',
							icon: 'EditOutline',
							label: 'Edit',
							onClick: onEdit
						},
						{
							id: 'delete',
							icon: 'TrashOutline',
							label: 'Delete',
							onClick: onDelete
						},
						{
							id: 'move',
							icon: 'MoveOutline',
							label: 'Move',
							onClick: onMove
						}
					]}
				>
					<IconButton size="medium" icon="MoreVertical" />
				</Dropdown>
			</Container>
		</Responsive>

		<Divider />
	</Container>
);

export default ContactPreviewHeader;
