/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, useEffect, Suspense, FC, ComponentType } from 'react';

import {
	Spinner,
	addRoute,
	addSettingsView,
	addSearchView,
	addBoardView,
	registerActions,
	ACTION_TYPES,
	addBoard,
	registerComponents,
	SearchViewProps
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { CONTACTS_ROUTE, CONTACTS_APP_ID } from './constants';
import { ContactInputIntegrationWrapper } from './legacy/integrations/contact-input-integration-wrapper';
import { StoreProvider } from './legacy/store/redux';
import { EditViewProps } from './legacy/types/views/edit-view';
import { SidebarProps } from './legacy/types/views/sidebar';
import SidebarItems from './legacy/views/secondary-bar/sidebar';
import { SyncDataHandler } from './legacy/views/secondary-bar/sync-data-handler';

const LazyAppView = lazy(
	() => import(/* webpackChunkName: "contacts-view" */ './legacy/views/app-view')
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

const AppView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyAppView />
		</StoreProvider>
	</Suspense>
);

const BoardView = (props: EditViewProps): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyBoardView {...props} />
		</StoreProvider>
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

const App: FC = () => {
	const [t] = useTranslation();
	useEffect(() => {
		addRoute({
			route: CONTACTS_ROUTE,
			position: 3,
			visible: true,
			label: t('label.app_name', 'Contacts'),
			primaryBar: 'ContactsModOutline',
			secondaryBar: SidebarView,
			appView: AppView
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
	}, [t]);

	useEffect(() => {
		registerComponents({
			id: 'contact-input',
			// FIXME: remove cast when SHELL-185 will be released
			component: ContactInputIntegrationWrapper as ComponentType
		});

		registerActions({
			action: () => ({
				id: 'new-contact',
				label: t('label.new_contact', 'New Contact'),
				icon: 'ContactsModOutline',
				onClick: (ev): void => {
					ev?.preventDefault?.();
					addBoard({ url: `${CONTACTS_ROUTE}/new`, title: t('label.new_contact', 'New Contact') });
				},
				disabled: false,
				group: CONTACTS_APP_ID,
				primary: true
			}),
			id: 'new-contact',
			type: ACTION_TYPES.NEW
		});
	}, [t]);

	return (
		<StoreProvider>
			<SyncDataHandler />
		</StoreProvider>
	);
};

export default App;
