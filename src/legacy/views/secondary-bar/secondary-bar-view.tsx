/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo } from 'react';

import { ThemeProvider } from '@mui/material';
import { Accordion, Divider } from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import { CollapsedSideBarFolderItem } from './collapsed-sidebar-folder-item';
import { CollapsedSideBarItem } from './collapsed-sidebar-item';
import { SidebarAccordionMui } from './sidebar-accordion';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { useRootsArray } from '../../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../../carbonio-ui-commons/theme/theme-mui';
import { LOCAL_STORAGES, ROUTES } from '../../../constants';
import { sortFolders } from '../../../helpers/folders';
import useGetTagsAccordion from '../../hooks/use-get-tags-accordions';

/**
 * Item component for the collapsed secondary bar
 * @param folder
 */

const SecondaryBarView: FC<SecondaryBarComponentProps> = ({ expanded = false }) => {
	const { folderId: selectedFolderId } = useParams<{ folderId: string }>();
	const tagsAccordionItems = useGetTagsAccordion();
	const { path } = useRouteMatch();
	const [t] = useTranslation();

	const roots = useRootsArray();
	const folders = useMemo(() => sortFolders(roots), [roots]);
	const collapsedItems = [] as Array<ReactElement>;
	const iconTooltip = t('Contact Groups');

	folders.length > 0 &&
		folders[0].children.forEach((folder) => {
			collapsedItems.push(
				<CollapsedSideBarFolderItem
					data-testid={`sidebar-folder-${folder.id}-collapsed`}
					key={folder.id}
					folder={folder}
				/>
			);
			if (folder.id === FOLDERS.CONTACTS) {
				const redirectPath = `/${ROUTES.contactGroups}/${FOLDERS.CONTACTS}`;
				collapsedItems.push(
					<CollapsedSideBarItem
						id={'contact-groups'}
						key={`sidebar-contact-group`}
						iconTooltip={iconTooltip}
						icon={'PeopleOutline'}
						redirectPath={redirectPath}
					/>
				);
			}
		});

	return (
		<>
			<ThemeProvider theme={themeMui}>
				{expanded ? (
					<Switch>
						<Route path={[`${path}/folder/:folderId/:type?/:itemId?`, `${path}/contact-groups`]}>
							<SidebarAccordionMui
								folders={folders}
								selectedFolderId={selectedFolderId}
								localStorageName={LOCAL_STORAGES.EXPANDED_ADDRESSBOOKS}
								initialExpanded={[FOLDERS.USER_ROOT]}
							/>

							<Divider />
							<Accordion items={[tagsAccordionItems]} />
						</Route>
					</Switch>
				) : (
					<div data-testid={'sidebar-collapsed'}>{collapsedItems}</div>
				)}
			</ThemeProvider>
		</>
	);
};

export default SecondaryBarView;
