/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, CustomModal, Input, Text } from '@zextras/carbonio-design-system';
import { filter, map, size, split } from 'lodash';
import { nanoid } from '@reduxjs/toolkit';
import FolderItem from './commons/folder-item';
import ModalFooter from '../contact-actions/commons/modal-footer';
import { ModalHeader } from './commons/modal-header';
import { createFolder } from '../../store/actions/create-folder';
import { getFolderTranslatedName } from '../../utils/helpers';

export const NewModal = ({
	folders,
	currentFolder,
	openModal,
	setModal,
	dispatch,
	t,
	createSnackbar
}) => {
	const [inputValue, setInputValue] = useState('');
	const [folderDestination, setFolderDestination] = useState(currentFolder);
	const [disabled, setDisabled] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [label, setLabel] = useState(t('folder.modal.new.input.name', 'Insert address book name'));

	const nest = useCallback(
		(items, id, level = 0) =>
			map(
				filter(items, (item) => item.parent === id && item.id !== '3'),
				(item) => {
					const folder =
						folderDestination.id === item.id
							? {
									...item,
									label: getFolderTranslatedName(t, item.id, item.label),
									items: nest(items, item.id, level + 1),
									background: 'highlight', // todo: fix with right color
									level
							  }
							: {
									...item,
									label: getFolderTranslatedName(t, item.id, item.label),
									items: nest(items, item.id, level + 1),
									level
							  };

					if (folder.level > 1) {
						return {
							...folder,
							onClick: () => setFolderDestination(folder),
							open:
								folder.open ??
								(size(split(currentFolder.path, '/')) === 1
									? currentFolder.id === item.id
									: currentFolder?.path?.includes?.(item?.label)),
							items: []
						};
					}
					return {
						...folder,
						onClick: () => setFolderDestination(folder),
						open:
							folder.open ??
							(size(split(currentFolder.path, '/')) === 1
								? currentFolder.id === item.id
								: currentFolder?.path?.includes?.(item?.label))
					};
				}
			),
		[currentFolder.id, currentFolder.path, folderDestination.id, t]
	);

	useEffect(() => {
		setFolderDestination(currentFolder);
	}, [currentFolder]);

	useEffect(() => {
		if (!folderDestination || !inputValue.length) {
			setDisabled(true);
			return;
		}
		const value = !!filter(folderDestination.items, (item) => item.label === inputValue).length;
		if (value) {
			setLabel(t('folder.modal.new.input.name_exist', 'Name already exists in this path'));
		} else {
			setLabel(t('folder.modal.new.input.name', 'Insert address book name'));
		}
		setHasError(value);
		setDisabled(value);
	}, [folderDestination, inputValue, t]);

	const rootEl = useMemo(
		() => ({
			id: '1',
			label: t('label.root', 'Root'),
			level: 0,
			open: true,
			parent: '0',
			background: folderDestination.id === '1' ? 'highlight' : undefined // todo: fix with right color
		}),
		[folderDestination.id, t]
	);

	const data = useMemo(() => nest([rootEl, ...folders], '0'), [folders, nest, rootEl]);

	const onConfirm = useCallback(() => {
		dispatch(
			createFolder({ parentFolder: folderDestination, name: inputValue, id: nanoid() })
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `new`,
					replace: true,
					type: 'success',
					label: t('folder.snackbar.folder_new', 'New address book created'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else {
				createSnackbar({
					key: `new`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
		setInputValue('');
		setLabel(t('folder.modal.new.input.name', 'Insert address book name'));
		setFolderDestination('');
		setModal('');
		setHasError(false);
	}, [createSnackbar, dispatch, folderDestination, inputValue, setModal, t]);

	const onClose = useCallback(() => {
		setInputValue('');
		setModal('');
		setFolderDestination('');
		setLabel(t('folder.modal.new.input.name', 'Insert address book name'));
		setHasError(false);
	}, [setModal, t]);

	return currentFolder ? (
		<CustomModal open={openModal} onClose={onClose} maxHeight="90vh">
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
				maxHeight="calc(100vh - 9rem)"
			>
				<ModalHeader
					title={t('folder.modal.new.title', 'Create new address book')}
					onClose={onClose}
				/>
				<Container
					padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
					maxHeight="calc(100vh - 13.125rem)"
				>
					<Container padding={{ all: 'small' }} mainAlignment="center" crossAlignment="flex-start">
						<Text overflow="break-word" weight="bold">
							{t('folder.modal.new.body.message1', 'New address book name')}
						</Text>
					</Container>
					<Input
						label={label}
						backgroundColor="gray5"
						hasError={hasError}
						defaultValue={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<Container
						padding={{ all: 'small', bottom: 'large', top: 'large' }}
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
					<ModalFooter
						onConfirm={onConfirm}
						label={t('label.create', 'Create')}
						t={t}
						disabled={disabled}
					/>
				</Container>
			</Container>
		</CustomModal>
	) : (
		<></>
	);
};
