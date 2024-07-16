/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, Suspense, useEffect } from 'react';

import { ModalManager, useSnackbar } from '@zextras/carbonio-design-system';
import {
	ACTION_TYPES,
	addBoard,
	addBoardView,
	addRoute,
	addSearchView,
	addSettingsView,
	registerActions,
	registerComponents,
	registerFunctions,
	SearchViewProps,
	SecondaryBarComponentProps,
	Spinner
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { FOLDER_VIEW } from './carbonio-ui-commons/constants';
import { useFoldersController } from './carbonio-ui-commons/hooks/use-folders-controller';
import {
	CONTACTS_APP_ID,
	CONTACTS_ROUTE,
	NEW_CONTACT_GROUP_BOARD_ID,
	GROUPS_ROUTE,
	EDIT_CONTACT_GROUP_BOARD_ID,
	EDIT_DL_BOARD_ID,
	CONTACT_BOARD_ID
} from './constants';
import { useNavigation } from './hooks/useNavigation';
import { ContactInputIntegrationWrapper } from './legacy/integrations/contact-input-integration-wrapper';
import createContactIntegration from './legacy/integrations/create-contact';
import { StoreProvider } from './legacy/store/redux';
import { SyncDataHandler } from './legacy/views/secondary-bar/sync-data-handler';

const LazyAppView = lazy(
	() => import(/* webpackChunkName: "contacts-view" */ './legacy/views/app-view')
);
const LazySecondaryBarView = lazy(
	() => import(/* webpackChunkName: "secondaryBarView" */ './views/SecondaryBarView')
);
const LazyLegacySecondaryBarView = lazy(
	() =>
		import(
			/* webpackChunkName: "legacySecondaryBarView" */ './legacy/views/secondary-bar/secondary-bar-view'
		)
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
	() => import(/* webpackChunkName: "edit-view" */ './legacy/views/edit/edit-view-board-wrapper')
);

const LazyNewContactGroupBoardView = lazy(
	() =>
		import(/* webpackChunkName: "newContactGroupView" */ './views/board/new-contact-group-board')
);

const LazyEditContactGroupBoardView = lazy(
	() =>
		import(/* webpackChunkName: "editContactGroupView" */ './views/board/edit-contact-group-board')
);

const LazyEditDLBoardView = lazy(
	() => import(/* webpackChunkName: "edit-dl-view" */ './views/board/edit-dl-board')
);

const AppView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyAppView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const SecondaryBarView = (props: SecondaryBarComponentProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<ModalManager>
			<LazySecondaryBarView {...props} />
		</ModalManager>
	</Suspense>
);

const AppViewV2 = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyGroupsAppView />
	</Suspense>
);

const BoardView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyBoardView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const NewContactGroupBoardView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<ModalManager>
			<LazyNewContactGroupBoardView />
		</ModalManager>
	</Suspense>
);

const EditContactGroupBoardView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<ModalManager>
			<LazyEditContactGroupBoardView />
		</ModalManager>
	</Suspense>
);

const EditDLBoardView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyEditDLBoardView />
	</Suspense>
);

const SettingsView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySettingsView />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const SearchView = (props: SearchViewProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazySearchView {...props} />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const LegacySecondaryBarView = (props: SecondaryBarComponentProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyLegacySecondaryBarView {...props} />
			</ModalManager>
		</StoreProvider>
	</Suspense>
);

const App = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { navigateTo } = useNavigation();
	const createSnackbar = useSnackbar();

	useEffect(() => {
		addRoute({
			route: CONTACTS_ROUTE,
			position: 300,
			visible: true,
			label: t('label.app_name', 'Contacts'),
			primaryBar: 'ContactsModOutline',
			secondaryBar: LegacySecondaryBarView,
			appView: AppView
		});
		addRoute({
			route: GROUPS_ROUTE,
			position: 310,
			visible: true,
			label: t('label.groups_app_name', 'Contact Groups and Distribution Lists'),
			primaryBar: 'ListOutline',
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
			id: CONTACT_BOARD_ID,
			component: BoardView
		});
		addBoardView({
			id: NEW_CONTACT_GROUP_BOARD_ID,
			component: NewContactGroupBoardView
		});
		addBoardView({
			id: EDIT_CONTACT_GROUP_BOARD_ID,
			component: EditContactGroupBoardView
		});
		addBoardView({
			id: EDIT_DL_BOARD_ID,
			component: EditDLBoardView
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
							boardViewId: CONTACT_BOARD_ID,
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
					onClick: (): void => {
						addBoard({
							boardViewId: NEW_CONTACT_GROUP_BOARD_ID,
							title: t('board.newContactGroup.title', 'New Group'),
							context: { navigateTo }
						});
					},
					disabled: false,
					primary: false,
					group: CONTACTS_APP_ID
				})
			}
		);
		registerFunctions({
			id: 'create_contact_from_vcard',
			fn: createContactIntegration(createSnackbar, t)
		});
	}, [createSnackbar, navigateTo, t]);

	useFoldersController(FOLDER_VIEW.contact);

	return (
		<StoreProvider>
			<SyncDataHandler />
		</StoreProvider>
	);
};

export default App;
