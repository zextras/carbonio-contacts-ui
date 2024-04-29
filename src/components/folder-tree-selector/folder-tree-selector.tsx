/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, useMemo, useState } from 'react';

import { Button, Container, Input, Padding } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { filter, startsWith } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlatFoldersAccordion } from './flat-folders-accordion';
import { isRoot, isTrash, isTrashed } from '../../carbonio-ui-commons/helpers/folders';
import { useFolder, useRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { sortFolders } from '../../helpers/folders';
import { getFolderTranslatedName } from '../../legacy/utils/helpers';

const ScrollableContainer = styled(Container)`
	overflow-y: auto;
	display: block;
`;

export type FolderTreeSelectorProps = {
	inputLabel?: string;
	onNewFolderClick?: () => void;
	selectedFolderId?: string;
	onFolderSelected: (arg: Folder) => void;
	showSharedAccounts: boolean;
	showTrashFolder: boolean;
	showLinkedFolders?: boolean;
	allowRootSelection: boolean;
	allowFolderCreation: boolean;
};

const flattenFolders = (
	t: TFunction,
	folders: Array<Folder>,
	options?: {
		showTrashFolder?: boolean;
		showLinkedFolders?: boolean;
	}
): Array<Folder> => {
	const result: Array<Folder> = [];
	const sortedFolders = sortFolders(folders);

	sortedFolders.forEach((folder) => {
		if (options?.showTrashFolder === false && (isTrash(folder.id) || isTrashed({ folder }))) {
			return;
		}

		if (options?.showLinkedFolders === false && folder.isLink === true) {
			return;
		}

		result.push({
			...folder,
			name: getFolderTranslatedName(t, folder.id, folder.name),
			children: []
		});
		folder.children && result.push(...flattenFolders(t, folder.children, options));
	});

	return result;
};

const flattenRootsFolders = (
	t: TFunction,
	roots: Array<Folder>,
	options?: {
		showTrashFolder?: boolean;
		showLinkedFolders?: boolean;
	}
): Array<Folder> =>
	roots.map((root) => ({
		...root,
		children: flattenFolders(t, root.children, options)
	}));

function filterRootChildren(folders: Array<Folder>, nameCriteria: string): Array<Folder> {
	return filter(folders, (folder) => {
		const folderName = folder.name?.toLowerCase();
		return startsWith(folderName, nameCriteria.toLowerCase());
	});
}

function filterRoots(roots: Array<Folder>, nameCriteria: string): Array<Folder> {
	return roots.reduce((acc, root) => {
		if (isRoot(root.id)) {
			acc.push({
				...root,
				children: root.children ? filterRootChildren(root.children, nameCriteria) : []
			});
		}
		return acc.filter((accItem) => !!accItem.children?.length);
	}, [] as Array<Folder>);
}

/**
 *
 * @param inputLabel
 * @param onNewFolderClick
 * @param selectedFolderId
 * @param onFolderSelected
 * @param allowRootSelection
 * @param allowFolderCreation
 * @param showTrashFolder - default <code>true</code>
 * @param showSharedAccounts
 * @param showLinkedFolders - default <code>true</code>
 * @constructor
 */
export const FolderTreeSelector = ({
	inputLabel,
	onNewFolderClick,
	selectedFolderId,
	onFolderSelected,
	allowRootSelection,
	allowFolderCreation,
	showTrashFolder,
	showSharedAccounts,
	showLinkedFolders
}: FolderTreeSelectorProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [inputValue, setInputValue] = useState('');
	const selectedFolder = useFolder(selectedFolderId ?? '');
	const roots = useRootsArray();
	const filteredAccountsRoots = useMemo<Array<Folder>>(
		() => (showSharedAccounts ? roots : roots.filter((root) => root.id === FOLDERS.USER_ROOT)),
		[roots, showSharedAccounts]
	);

	const flattenRoots = useMemo(
		() =>
			flattenRootsFolders(t, filteredAccountsRoots, {
				showTrashFolder,
				showLinkedFolders
			}),
		[filteredAccountsRoots, showTrashFolder, t]
	);

	const filteredRoots = filterRoots(flattenRoots, inputValue);
	const inputName = selectedFolder ? selectedFolder.name : '';
	return (
		<>
			<Input
				data-testid={'folder-name-filter'}
				inputName={inputName}
				label={inputLabel ?? t('label.filter_folders', 'Filter folders')}
				backgroundColor="gray5"
				value={inputValue}
				onChange={(e: ChangeEvent<HTMLInputElement>): void => setInputValue(e.target.value)}
			/>
			<Padding vertical="medium" />
			<ScrollableContainer
				orientation="vertical"
				mainAlignment="flex-start"
				minHeight="30vh"
				maxHeight="60vh"
			>
				<FlatFoldersAccordion
					roots={filteredRoots}
					onFolderSelected={onFolderSelected}
					selectedFolderId={selectedFolderId}
					allowRootSelection={allowRootSelection}
				/>
			</ScrollableContainer>
			{onNewFolderClick && (
				<Container
					padding={{ top: 'medium', bottom: 'medium' }}
					mainAlignment="center"
					crossAlignment="flex-start"
				>
					<Button
						type="ghost"
						label={t('label.new_folder', 'New Folder')}
						color="primary"
						onClick={onNewFolderClick}
					/>
				</Container>
			)}
		</>
	);
};
