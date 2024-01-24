/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, Suspense, useEffect } from 'react';

import {
	ACTION_TYPES,
	addBoard,
	addBoardView,
	addRoute,
	addSearchView,
	addSettingsView,
	registerActions,
	registerComponents,
	SearchViewProps,
	SecondaryBarComponentProps,
	Spinner
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import {
	CONTACTS_APP_ID,
	CONTACTS_ROUTE,
	NEW_CONTACT_GROUP_BOARD_ID,
	GROUPS_ROUTE,
	EDIT_CONTACT_GROUP_BOARD_ID
} from './constants';
import { ContactInputIntegrationWrapper } from './legacy/integrations/contact-input-integration-wrapper';
import { StoreProvider } from './legacy/store/redux';
import { EditViewProps } from './legacy/types/views/edit-view';
import { SidebarProps } from './legacy/types/views/sidebar';
import SidebarItems from './legacy/views/secondary-bar/sidebar';
import { SyncDataHandler } from './legacy/views/secondary-bar/sync-data-handler';

const LazyAppView = lazy(
	() => import(/* webpackChunkName: "contacts-view" */ './legacy/views/app-view')
);
const LazySecondaryBarView = lazy(
	() => import(/* webpackChunkName: "secondaryBarView" */ './views/SecondaryBarView')
);
const LazyGroupsAppView = lazy(
	() => import(/* webpackChunkName: "groupsAppView" */ './views/GroupsAppView')
);
const LazySettingsView = lazy(
	() => import(/* webpackChunkName: "settings-view" */ './legacy/views/settings/settings-view')
);
const LazySearchView = lazy(
	() => import(/* webpackChunkName: "search-view" */ './legacy/views/search/search-view')
);

const LazyBoardView = lazy(
	() => import(/* webpackChunkName: "edit-view" */ './legacy/views/edit/edit-view')
);

const LazyNewContactGroupBoardView = lazy(
	() =>
		import(/* webpackChunkName: "newContactGroupView" */ './views/board/new-contact-group-board')
);

const LazyEditContactGroupBoardView = lazy(
	() =>
		import(/* webpackChunkName: "editContactGroupView" */ './views/board/edit-contact-group-board')
);

const AppView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyAppView />
		</StoreProvider>
	</Suspense>
);

const SecondaryBarView = (props: SecondaryBarComponentProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazySecondaryBarView {...props} />
	</Suspense>
);

const AppViewV2 = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyGroupsAppView />
	</Suspense>
);

const BoardView = (props: EditViewProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyBoardView {...props} />
		</StoreProvider>
	</Suspense>
);

const NewContactGroupBoardView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyNewContactGroupBoardView />
	</Suspense>
);

const EditContactGroupBoardView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyEditContactGroupBoardView />
	</Suspense>
);

const SettingsView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySettingsView />
		</StoreProvider>
	</Suspense>
);

const SearchView = (props: SearchViewProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySearchView {...props} />
		</StoreProvider>
	</Suspense>
);

const SidebarView = (props: SidebarProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<SidebarItems {...props} />
		</StoreProvider>
	</Suspense>
);

const App = (): React.JSX.Element => {
	const [t] = useTranslation();
	useEffect(() => {
		addRoute({
			route: CONTACTS_ROUTE,
			position: 300,
			visible: true,
			label: t('label.app_name', 'Contacts'),
			primaryBar: 'ContactsModOutline',
			secondaryBar: SidebarView,
			appView: AppView
		});
		addRoute({
			route: GROUPS_ROUTE,
			position: 310,
			visible: true,
			label: t('label.groups_app_name', 'Contact Groups and Distribution Lists'),
			primaryBar: 'ContactsModOutline',
			secondaryBar: SecondaryBarView,
			appView: AppViewV2
		});
		addSettingsView({
			route: CONTACTS_ROUTE,
			label: t('label.app_name', 'Contacts'),
			component: SettingsView
		});
		addSearchView({
			route: CONTACTS_ROUTE,
			label: t('label.app_name', 'Contacts'),
			component: SearchView
		});
		addBoardView({
			route: CONTACTS_ROUTE,
			component: BoardView
		});
		addBoardView({
			id: NEW_CONTACT_GROUP_BOARD_ID,
			route: NEW_CONTACT_GROUP_BOARD_ID,
			component: NewContactGroupBoardView
		});
		addBoardView({
			id: EDIT_CONTACT_GROUP_BOARD_ID,
			route: EDIT_CONTACT_GROUP_BOARD_ID,
			component: EditContactGroupBoardView
		});
	}, [t]);

	useEffect(() => {
		registerComponents({
			id: 'contact-input',
			component: ContactInputIntegrationWrapper
		});

		registerActions(
			{
				action: () => ({
					id: 'new-contact',
					label: t('label.new_contact', 'New Contact'),
					icon: 'ContactsModOutline',
					onClick: (ev): void => {
						ev?.preventDefault?.();
						addBoard({
							url: `${CONTACTS_ROUTE}/new`,
							title: t('label.new_contact', 'New Contact')
						});
					},
					disabled: false,
					group: CONTACTS_APP_ID,
					primary: true
				}),
				id: 'new-contact',
				type: ACTION_TYPES.NEW
			},
			{
				id: 'new-contact-group',
				type: ACTION_TYPES.NEW,
				action: () => ({
					id: 'new-contact-group',
					label: t('label.newContactGroup', 'New contact group'),
					icon: 'PeopleOutline',
					onClick: (ev): void => {
						addBoard({
							url: NEW_CONTACT_GROUP_BOARD_ID,
							title: t('board.newContactGroup.title', 'New Group')
						});
					},
					disabled: false,
					primary: false,
					group: CONTACTS_APP_ID
				})
			}
		);
	}, [t]);

	return (
		<StoreProvider>
			<SyncDataHandler />
		</StoreProvider>
	);
};

export default App;
