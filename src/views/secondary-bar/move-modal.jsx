/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';
import { Input, Text, Container, CustomModal, Padding } from '@zextras/carbonio-design-system';
import { filter, startsWith, reduce, isEmpty, split, size } from 'lodash';
import { useReplaceHistoryCallback, FOLDERS } from '@zextras/carbonio-shell-ui';
import FolderItem from './commons/folder-item';
import { folderAction } from '../../store/actions/folder-action';
import ModalFooter from '../contact-actions/commons/modal-footer';
import { ModalHeader } from './commons/modal-header';

export const MoveModal = ({
	folders,
	currentFolder,
	openModal,
	setModal,
	dispatch,
	t,
	createSnackbar
}) => {
	const [input, setInput] = useState('');
	const [folderDestination, setFolderDestination] = useState(currentFolder || {});
	const replaceHistory = useReplaceHistoryCallback();

	const onClose = useCallback(() => {
		setModal('');
		setInput('');
		setFolderDestination('');
	}, [setModal]);

	const filterFromInput = useMemo(
		() =>
			filter(folders, (v) => {
				if (isEmpty(v)) {
					return false;
				}
				if (
					v.id === currentFolder.id ||
					v.id === currentFolder.parent ||
					v.parent === FOLDERS.TRASH ||
					v.path.includes(currentFolder.label)
				) {
					return false;
				}
				return startsWith(v?.label?.toLowerCase(), input?.toLowerCase());
			}),
		[folders, currentFolder.id, currentFolder.parent, currentFolder.label, input]
	);

	const nestFilteredFolders = useCallback(
		(items, id, results, level = 0) =>
			reduce(
				filter(items, (item) => item.parent === id),
				(acc, item) => {
					const match = filter(results, (result) => result.id === item.id);
					if (match && match.length) {
						return [
							...acc,
							{
								...item,
								items: nestFilteredFolders(items, item.id, results, level + 1),
								onClick: () => setFolderDestination(item),
								level: level + 1,
								open: !!input.length,
								divider: true,
								background: folderDestination.id === item.id ? 'highlight' : undefined
							}
						];
					}
					if (match && !match.length) {
						return [...acc, ...nestFilteredFolders(items, item.id, results, level)];
					}
					return acc;
				},
				[]
			),
		[folderDestination.id, input.length]
	);

	const nestedData = useMemo(
		() => [
			{
				id: FOLDERS.USER_ROOT,
				label: 'Root',
				level: '0',
				open: true,
				divider: true,
				items: nestFilteredFolders(folders, FOLDERS.USER_ROOT, filterFromInput),
				background: folderDestination.id === FOLDERS.USER_ROOT ? 'highlight' : undefined,
				onClick: () => setFolderDestination({ id: FOLDERS.USER_ROOT })
			}
		],
		[filterFromInput, folderDestination.id, folders, nestFilteredFolders]
	);

	const onConfirm = useCallback(() => {
		if (
			folderDestination?.id !== currentFolder?.id &&
			folderDestination.id !== currentFolder.parent
		) {
			dispatch(
				folderAction({
					folder: currentFolder,
					l: folderDestination.id || FOLDERS.USER_ROOT,
					op: 'move'
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'info',
						label: t('folder.action.moved', 'Address book moved successfully'),
						autoHideTimeout: 3000,
						actionLabel: t('action.goto_folder', 'Go to folder'),
						onActionClick: () => {
							replaceHistory(`/folder/${folderDestination.id}`);
						}
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
		setModal('');
		setFolderDestination('');
	}, [
		folderDestination.id,
		currentFolder,
		setModal,
		dispatch,
		onClose,
		createSnackbar,
		t,
		replaceHistory
	]);

	return currentFolder ? (
		<CustomModal open={openModal} onClose={onClose} maxHeight="90vh">
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader
					title={`${t('label.move', 'Move')} ${currentFolder.label}`}
					onClose={onClose}
				/>
				<Container
					padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
				>
					<Container padding={{ all: 'small' }} mainAlignment="center" crossAlignment="flex-start">
						<Text overflow="break-word">
							{t(
								'folder.modal.move.body.message1',
								'Select an address book to move the considered one to:'
							)}
						</Text>
					</Container>
					<Input
						inputName={currentFolder.label}
						label={t('folder.modal.move.input.filter', 'Filter address book')}
						backgroundColor="gray5"
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
					<Padding vertical="medium" />
					<FolderItem folders={nestedData} />
					<Container
						padding={{ top: 'medium', bottom: 'medium' }}
						mainAlignment="center"
						crossAlignment="flex-start"
					>
						<Text size="large" color="primary">
							{t('label.new_address_book', 'New address Book')}
						</Text>{' '}
						{/* todo: fix with right component */}
					</Container>
					<ModalFooter
						onConfirm={onConfirm}
						label={t('label.move', 'Move')}
						disabled={!folderDestination.id}
						t={t}
					/>
				</Container>
			</Container>
		</CustomModal>
	) : (
		<></>
	);
};
