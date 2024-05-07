/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Container,
	Divider,
	Icon,
	ModalBody,
	ModalHeader,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { findLabel, getShareFolderRoleOptions } from './shares-utils';
import { Folder } from '../../carbonio-ui-commons/types/folder';

const ShareInfoRow = ({
	icon,
	label,
	text
}: {
	icon: string;
	label: string;
	text: string;
}): React.JSX.Element => (
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

export type ShareInfoModalProps = {
	onClose: () => void;
	addressBook: Folder;
};

export const ShareInfoModal = ({
	onClose,
	addressBook
}: ShareInfoModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const roleOptions = useMemo(() => getShareFolderRoleOptions(t), [t]);

	const role = useMemo(
		() => findLabel(roleOptions, addressBook.perm ?? ''),
		[roleOptions, addressBook.perm]
	);
	const text = (/r/.test(addressBook.perm || '') ? `${t('share.read', 'Read')}` : '')
		.concat(/w/.test(addressBook.perm || '') ? `, ${t('share.write', 'Write')}` : '')
		.concat(/i/.test(addressBook.perm || '') ? `, ${t('share.insert', 'Insert')}` : '')
		.concat(/d/.test(addressBook.perm || '') ? `, ${t('label.delete', 'Delete')}` : '')
		.concat(/a/.test(addressBook.perm || '') ? `, ${t('share.administer', 'Administer')}` : '')
		.concat(/c/.test(addressBook.perm || '') ? `, ${t('label.create', 'Create')}` : '')
		.concat(/x/.test(addressBook.perm || '') ? `, ${t('share.workflow', 'Workflow')}` : '');
	return (
		<Container
			padding={'small'}
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
				showCloseIcon
			/>
			<Divider />
			<ModalBody>
				<ShareInfoRow
					icon="InfoOutline"
					label={`${t('share.shared_item', 'Shared Item')}`}
					text={addressBook.name}
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
					text={`${addressBook.n}`}
				/>
				<ShareInfoRow
					icon="UnlockOutline"
					label={`${t('share.allowed_actions', 'Allowed actions')}`}
					text={text}
				/>
			</ModalBody>
		</Container>
	);
};
