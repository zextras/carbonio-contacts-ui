/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ModalHeader } from './commons/modal-header';
import { findLabel, ShareCalendarRoleOptions } from './commons/utils';

export const ShareInfoRow = ({ icon, label, text }) => (
	<Row
		width="fill"
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		padding={{ top: 'small' }}
	>
		<Row>
			<Icon icon={icon} />
			<Row padding={{ right: 'small', left: 'small' }}>
				<Text weight="bold">{`${label} :`}</Text>
			</Row>
		</Row>
		<Row takeAvailableSpace mainAlignment="flex-start">
			<Text overflow="break-word">{text}</Text>
		</Row>
	</Row>
);

export const SharesInfoModal = ({ onClose, folder }) => {
	const [t] = useTranslation();
	const roleOptions = useMemo(() => ShareCalendarRoleOptions(t), [t]);

	const role = useMemo(() => findLabel(roleOptions, folder.perm || ''), [roleOptions, folder.perm]);
	const text = (/r/.test(folder.perm || '') ? `${t('share.read', 'Read')}` : '')
		.concat(/w/.test(folder.perm || '') ? `, ${t('share.write', 'Write')}` : '')
		.concat(/i/.test(folder.perm || '') ? `, ${t('share.insert', 'Insert')}` : '')
		.concat(/d/.test(folder.perm || '') ? `, ${t('label.delete', 'Delete')}` : '')
		.concat(/a/.test(folder.perm || '') ? `, ${t('share.administer', 'Administer')}` : '')
		.concat(/c/.test(folder.perm || '') ? `, ${t('label.create', 'Create')}` : '')
		.concat(/x/.test(folder.perm || '') ? `, ${t('share.workflow', 'Workflow')}` : '');
	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			onClick={(e) => {
				if (e) {
					e.stopPropagation();
				}
			}}
		>
			<ModalHeader
				title={`${t('share.share_info', "Shared address book's info")} `}
				onClose={onClose}
			/>
			<Padding top="small" />
			<ShareInfoRow
				icon="InfoOutline"
				label={`${t('share.shared_item', 'Shared Item')}`}
				text={folder.name}
			/>
			<ShareInfoRow
				icon="PersonOutline"
				label={`${t('share.owner', 'Owner')}`}
				text={folder.owner}
			/>
			<ShareInfoRow
				icon="ContactsModOutline"
				label={`${t('label.type', 'Type')}`}
				text={t('share.contact_folder', 'Address Book')}
			/>
			<ShareInfoRow icon="ShieldOutline" label={`${t('share.role', 'Role')}`} text={role} />
			<ShareInfoRow
				icon="PeopleOutline"
				label={`${t('label.contacts', 'Contacts')}`}
				text={folder.n}
			/>
			<ShareInfoRow
				icon="UnlockOutline"
				label={`${t('share.allowed_actions', 'Allowed actions')}`}
				text={text}
			/>
			<Padding bottom="medium" />
		</Container>
	);
};
