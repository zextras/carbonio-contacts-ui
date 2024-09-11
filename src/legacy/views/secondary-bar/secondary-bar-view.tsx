/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';

import { ThemeProvider } from '@mui/material';
import { Accordion, Divider } from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import { CollapsedSideBarItems } from './collapsed-sidebar-folders';
import { SidebarAccordionMui } from './sidebar-accordion';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { FOLDER_VIEW } from '../../../carbonio-ui-commons/constants/utils';
import { useInitializeFolders } from '../../../carbonio-ui-commons/hooks/use-initialize-folders';
import { useRootsArray } from '../../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../../carbonio-ui-commons/theme/theme-mui';
import { LOCAL_STORAGES } from '../../../constants';
import { sortFolders } from '../../../helpers/folders';
import useGetTagsAccordion from '../../hooks/use-get-tags-accordions';

/**
 * Item component for the collapsed secondary bar
 * @param folder
 */

const SecondaryBarView: FC<SecondaryBarComponentProps> = ({ expanded = false }) => {
	useInitializeFolders(FOLDER_VIEW.contact);
	const { folderId: selectedFolderId } = useParams<{ folderId: string }>();
	const tagsAccordionItems = useGetTagsAccordion();
	const { path } = useRouteMatch();

	const roots = useRootsArray();
	const folders = useMemo(() => sortFolders(roots), [roots]);

	return (
		<>
			<ThemeProvider theme={themeMui}>
				{expanded ? (
					<Switch>
						<Route path={`${path}/folder/:folderId/:type?/:itemId?`}>
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
					folders[0].children.map((folder) => (
						<CollapsedSideBarItems key={folder.id} folder={folder} />
					))
				)}
			</ThemeProvider>
		</>
	);
};

export default SecondaryBarView;
