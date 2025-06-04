/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo } from 'react';

import { ThemeProvider } from '@mui/material';
import { Container, Divider } from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';
import {
	SidebarAccordionMui,
	FOLDERS,
	useRootsArray,
	themeMui,
	Folder
} from '@zextras/carbonio-ui-commons';
import { map } from 'lodash';
import { Route, Routes, useParams } from 'react-router-dom';

import { AccordionCustomComponent } from './accordion-custom-component';
import { CollapsedSideBarFolderItem } from './collapsed-sidebar-folder-item';
import { FindSharesButton } from './find-shares-button';
import { TagsAccordion } from './tags-accordion';
import { LOCAL_STORAGES } from '../../../constants';
import { sortFolders } from '../../../helpers/folders';

/**
 * Item component for the collapsed secondary bar
 * @param folder
 */

export type SidebarComponentProps = {
	accordions: Array<Folder>;
};
const SidebarComponent = ({ accordions }: SidebarComponentProps): React.JSX.Element => {
	const { folderId } = useParams<{ folderId: string }>();

	const accordionsWithFindShare = useMemo(() => {
		if (!accordions?.[0]?.children.find((folder: Folder) => folder.id === 'find_shares')) {
			accordions[0]?.children?.push({
				id: 'find_shares',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				disableHover: true
			});
		}
		return map(accordions, (item) => ({ ...item, background: 'gray4' }));
	}, [accordions]);
	return (
		<Container orientation="vertical" height="fit" width="fill">
			<SidebarAccordionMui
				accordions={accordionsWithFindShare}
				folderId={folderId ?? ''}
				localStorageName={LOCAL_STORAGES.EXPANDED_ADDRESSBOOKS}
				AccordionCustomComponent={AccordionCustomComponent}
				buttonFindShares={<FindSharesButton key={'find-shares-button'} />}
				initialExpanded={[FOLDERS.USER_ROOT]}
			/>

			<Divider />
			<TagsAccordion />
		</Container>
	);
};

const SecondaryBarView: FC<SecondaryBarComponentProps> = ({ expanded = false }) => {
	const roots = useRootsArray();
	const folders = useMemo(() => sortFolders(roots), [roots]);
	const collapsedItems = [] as Array<ReactElement>;

	folders.length > 0 &&
		folders[0].children.forEach((folder) => {
			collapsedItems.push(
				<CollapsedSideBarFolderItem
					data-testid={`sidebar-folder-${folder.id}-collapsed`}
					key={folder.id}
					folder={folder}
				/>
			);
		});

	return (
		<ThemeProvider theme={themeMui}>
			{expanded ? (
				<Routes>
					<Route
						path={`folder/:folderId/:type?/:itemId?`}
						element={<SidebarComponent accordions={folders} />}
					/>
				</Routes>
			) : (
				<div data-testid={'sidebar-collapsed'}>{collapsedItems}</div>
			)}
		</ThemeProvider>
	);
};

export default SecondaryBarView;
