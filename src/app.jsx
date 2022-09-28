/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, useEffect, Suspense } from 'react';
import {
	Spinner,
	addRoute,
	addSettingsView,
	addSearchView,
	addBoardView,
	registerActions,
	ACTION_TYPES,
	addBoard,
	registerComponents
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import SidebarItems from './views/secondary-bar/sidebar';
import ContactInput from './integrations/contact-input';
import { SyncDataHandler } from './views/secondary-bar/sync-data-handler';
import { CONTACTS_ROUTE, CONTACTS_APP_ID } from './constants';
import { StoreProvider } from './store/redux';

const LazyAppView = lazy(() => import(/* webpackChunkName: "contacts-view" */ './views/app-view'));

const LazySettingsView = lazy(() =>
	import(/* webpackChunkName: "settings-view" */ './views/settings/settings-view')
);
const LazySearchView = lazy(() =>
	import(/* webpackChunkName: "edit-view" */ './views/search/search-view')
);
const LazyBoardView = lazy(() =>
	import(/* webpackChunkName: "edit-view" */ './views/edit/edit-view')
);

const AppView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyAppView {...props} />
		</StoreProvider>
	</Suspense>
);

const BoardView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazyBoardView {...props} />
		</StoreProvider>
	</Suspense>
);

const SettingsView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySettingsView {...props} />
		</StoreProvider>
	</Suspense>
);

const SearchView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<LazySearchView {...props} />
		</StoreProvider>
	</Suspense>
);

const SidebarView = (props) => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<SidebarItems {...props} />
		</StoreProvider>
	</Suspense>
);
export default function App() {
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
			component: ContactInput
		});
		registerActions({
			action: () => ({
				id: 'new-contact',
				label: t('label.new_contact', 'New Contact'),
				icon: 'ContactsModOutline',
				click: (ev) => {
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
}
