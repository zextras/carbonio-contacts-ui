/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { FolderActionsType } from '../../../types/folder';
import { getFolder } from '../../../store/actions/get-folder';
import { SharesInfoModal } from '../shares-info-modal';
import { folderAction } from '../../../store/actions/folder-action';

export const actionsRetriever = (
	folder,
	setAction,
	setCurrentFolder,
	t,
	dispatch,
	createModal,
	createSnackbar,
	trashFolder
) => [
	{
		id: FolderActionsType.NEW,
		icon: 'AddressBookOutline',
		label: t('label.new_address_book', 'New address book'),
		click: () => {
			setAction(FolderActionsType.NEW);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.MOVE,
		icon: 'MoveOutline',
		label: t('folder.action.move', 'Move'),
		click: () => {
			setAction(FolderActionsType.MOVE);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.SHARE,
		icon: 'ShareOutline',
		label: t('folder.share_folder', 'Share address book'),
		click: () => {
			setAction(FolderActionsType.SHARE);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.EMPTY,
		icon: folder.id === FOLDERS.TRASH ? 'DeletePermanentlyOutline' : 'EmptyFolderOutline',
		label:
			folder.id === FOLDERS.TRASH
				? t('folder.action.empty.trash', 'Empty trash')
				: t('folder.action.empty.folder', 'Empty address book'),
		disabled: folder.id === FOLDERS.TRASH ? false : !folder.itemsCount,
		click: () => {
			setAction(FolderActionsType.EMPTY);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.EDIT,
		icon: 'Edit2Outline',
		label: t('folder.action.edit', 'Edit address book'),
		click: () => {
			setAction(FolderActionsType.EDIT);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.DELETE,
		icon: 'Trash2Outline',
		label:
			folder?.path?.includes?.(`/${trashFolder?.label}/`) && folder?.id !== FOLDERS.TRASH
				? t('folder.action.delete_permanently', 'Delete address book permanently')
				: t('folder.action.delete', 'Delete address book'),
		click: () => {
			setAction(FolderActionsType.DELETE);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.REMOVE_FROM_LIST,
		icon: 'CloseOutline',
		label: t('share.remove_from_this_list', 'Remove from this list'),
		click: (e) => {
			if (e) {
				e.stopPropagation();

				dispatch(folderAction({ folder, l: folder.parent, op: 'delete' })).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'info',
							hideButton: true,
							label: t('share.share_removed_succesfully', 'Shared removed successfuly'),
							autoHideTimeout: 3000
						});
					} else {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'error',
							hideButton: true,
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000
						});
					}
				});
			}
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.SHARE_INFO,
		icon: 'InfoOutline',
		label: t('share.share_info', "Shared address book's info"),
		click: (e) => {
			if (e) {
				e.stopPropagation();
			}
			setCurrentFolder(folder);
			dispatch(getFolder(folder.id)).then((res) => {
				if (res.type.includes('fulfilled')) {
					const closeModal = createModal(
						{
							children: (
								<SharesInfoModal
									onClose={() => {
										closeModal();
									}}
									folder={res.payload}
								/>
							)
						},
						true
					);
				}
			});
		}
	}
];
