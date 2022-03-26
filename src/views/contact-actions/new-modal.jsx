/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Input, Row, Text } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, map, size, split } from 'lodash';
import { nanoid } from '@reduxjs/toolkit';
import ModalFooter from './commons/modal-footer';
import { ModalHeader } from '../secondary-bar/commons/modal-header';
import { createFolder } from '../../store/actions/create-folder';
import { contactAction } from '../../store/actions/contact-action';
import FolderItem from '../secondary-bar/commons/folder-item';

export const NewModal = ({
	folders,
	currentFolder,
	onClose,
	dispatch,
	t,
	contactId,
	originID,
	folderId,
	createSnackbar,
	goBack
}) => {
	const [inputValue, setInputValue] = useState('');
	const [folderDestination, setFolderDestination] = useState();
	const [disabled, setDisabled] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [label, setLabel] = useState('');

	useEffect(() => {
		if (!folderDestination || !inputValue.length) {
			setDisabled(true);
			return;
		}

		const value = !!filter(folders, (item) => item.label === inputValue).length;
		if (value) {
			setLabel(t('folder.modal.new.input.name_exist', 'Name already exists in this path'));
		}
		setHasError(value);
		setDisabled(value);
	}, [folderDestination, inputValue, folders, t]);
	const onConfirm = useCallback(() => {
		dispatch(
			createFolder({ parentFolder: folderDestination, name: inputValue, id: nanoid() })
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				if (folderDestination?.id !== folderId && folderDestination !== originID) {
					dispatch(
						contactAction({
							contactsIDs: [contactId],
							originID,
							destinationID: res.payload[0].id || FOLDERS.USER_ROOT,
							op: 'move'
						})
					).then(() => {
						if (res.type.includes('fulfilled')) {
							createSnackbar({
								key: `move`,
								replace: true,
								type: 'info',
								label: t('messages.snackbar.contact_moved', 'Contact moved'),
								autoHideTimeout: 3000,
								hideButton: true
							});
						} else {
							createSnackbar({
								key: `move`,
								replace: true,
								type: 'error',
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								autoHideTimeout: 3000,
								hideButton: true
							});
						}
						onClose();
					});
				}
			} else {
				createSnackbar({
					key: `move`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
		setInputValue('');
		setFolderDestination('');
		setHasError(false);
	}, [
		dispatch,
		folderDestination,
		inputValue,
		onClose,
		contactId,
		folderId,
		originID,
		createSnackbar,
		t
	]);

	const nest = useCallback(
		(items, id, level = 0) =>
			map(
				filter(items, (item) => item.parent === id && item.id !== FOLDERS.TRASH),
				(item) => {
					const folder =
						folderDestination?.id === item.id
							? {
									...item,
									divider: true,
									items: nest(items, item.id, level + 1),
									background: 'highlight', // todo: fix with right color
									level
							  }
							: {
									...item,
									items: nest(items, item.id, level + 1),
									divider: true,
									level
							  };
					const splittedFolder = split(item.path, '/');
					const folderLabel = splittedFolder[1];
					const open =
						folder.open ??
						(size(split(currentFolder.path, '/')) === 2
							? currentFolder.id === item.id
							: currentFolder?.path?.includes?.(folderLabel));
					if (folder.level > 1) {
						return {
							...folder,
							divider: true,
							onClick: () => setFolderDestination(folder),
							open,
							items: []
						};
					}

					return {
						...folder,
						divider: true,
						onClick: () => setFolderDestination(folder),
						open
					};
				}
			),
		[currentFolder.id, currentFolder.path, folderDestination?.id]
	);

	const rootEl = useMemo(
		() => ({
			id: FOLDERS.USER_ROOT,
			label: t('label.root', 'Root'),
			level: 0,
			open: true,
			parent: '0',
			divider: true,
			background: folderDestination?.id === FOLDERS.USER_ROOT ? 'highlight' : undefined // todo: fix with right color
		}),
		[folderDestination?.id, t]
	);

	const data = useMemo(() => nest([rootEl, ...folders], '0'), [folders, nest, rootEl]);
	return currentFolder ? (
		<>
			<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
				<ModalHeader
					title={t('folder.modal.new.title2', 'New folder creation')}
					onClose={onClose}
				/>
				<Container
					// padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
				>
					<Container
						padding={{ vertical: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
					>
						<Text overflow="break-word" weight="bold">
							{t(
								'folder.modal.move.body.message3',
								'Select a folder to move the considered one to:'
							)}
						</Text>
					</Container>

					<Container mainAlignment="baseline" crossAlignment="flex-start">
						<Row width="100%">
							<Input
								label={t('label.folder_name', 'Folder name')}
								backgroundColor="gray5"
								hasError={hasError}
								defaultValue={inputValue}
								onChange={(e) => {
									if (label.length > 0) setLabel('');
									setInputValue(e.target.value);
								}}
							/>
							<Text color="error">{label}</Text>
						</Row>
						<Container
							padding={{ vertical: 'small' }}
							mainAlignment="center"
							crossAlignment="flex-start"
							height="fit"
						>
							<Text overflow="break-word" weight="bold">
								{t(
									'folder.modal.new.body.message2',
									'Select an address book which will contain the newly created one:'
								)}
							</Text>
						</Container>
						<FolderItem folders={data} />
					</Container>

					<ModalFooter
						onConfirm={onConfirm}
						secondaryAction={goBack}
						secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
						label={
							folderId === FOLDERS.TRASH
								? t('folder.modal.restore.create_footer', 'Create and Restore')
								: t('folder.modal.new.create_footer', 'Create and Move')
						}
						t={t}
						disabled={disabled}
					/>
				</Container>
			</Container>
		</>
	) : (
		<></>
	);
};
