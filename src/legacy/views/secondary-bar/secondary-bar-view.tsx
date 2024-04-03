/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { ThemeProvider } from '@mui/material';
import { Divider } from '@zextras/carbonio-design-system';
import { FOLDERS, SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import { SidebarAccordionMui } from '../../../carbonio-ui-commons/components/sidebar/sidebar-accordion-mui';
import { useFoldersArrayByRoot } from '../../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../../carbonio-ui-commons/theme/theme-mui';
import { LOCAL_STORAGES } from '../../../constants';
import useGetTagsAccordion from '../../hooks/use-get-tags-accordions';

const SecondaryBarView: FC<SecondaryBarComponentProps> = ({ expanded = false }) => {
	const folders = useFoldersArrayByRoot(FOLDERS.USER_ROOT);
	const { folderId: selectedFolderId } = useParams<{ folderId: string }>();
	const tagsAccordionItems = useGetTagsAccordion();
	const { path } = useRouteMatch();
	return (
		<>
			<ThemeProvider theme={themeMui}>
				{expanded ? (
					<Switch>
						<Route path={`${path}/folder/:folderId/:type?/:itemId?`}>
							<SidebarAccordionMui
								accordions={folders}
								folderId={selectedFolderId}
								localStorageName={LOCAL_STORAGES.EXPANDED_ADDRESSBOOKS}
								AccordionCustomComponent={AccordionCustomComponent}
								buttonFindShares={<ButtonFindShares key="button-find-shares" />}
								initialExpanded={[FOLDERS.USER_ROOT]}
							/>

							<Divider />
							<Accordion items={[tagsAccordionItems]} />
						</Route>
					</Switch>
				) : (
					accordions[0].children.map((folder) => (
						<CollapsedSideBarItems key={folder.id} folder={folder} />
					))
				)}
			</ThemeProvider>
		</>
	);
};

export default SecondaryBarView;
