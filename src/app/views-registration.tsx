/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, lazy, Suspense, useEffect } from 'react';

import { ModalManager } from '@zextras/carbonio-design-system';
import type * as SearchUI from '@zextras/carbonio-search-ui';
import {
	addBoardView,
	addRoute,
	addSettingsView,
	SecondaryBarComponentProps,
	useIntegratedFunction
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { Spinner } from '../components/Spinner';
import {
	CONTACT_BOARD_ID,
	CONTACTS_APP_ID,
	CONTACTS_ROUTE,
	EDIT_CONTACT_GROUP_BOARD_ID,
	EDIT_DL_BOARD_ID,
	GROUPS_ROUTE,
	NEW_CONTACT_GROUP_BOARD_ID
} from '../constants';
import { StoreProvider } from '../legacy/store/redux';

const LazyContactsView = lazy(
	() => import(/* webpackChunkName: "contacts-view" */ '../views/contacts-view')
);
const LazySecondaryBarView = lazy(
	() =>
		import(/* webpackChunkName: "secondaryBarView" */ '../views/distribution-list/SecondaryBarView')
);
const LazyLegacySecondaryBarView = lazy(
	() =>
		import(
			/* webpackChunkName: "legacySecondaryBarView" */ '../legacy/views/secondary-bar/secondary-bar-view'
		)
);

const LazyDistributionListAppView = lazy(
	() => import(/* webpackChunkName: "groupsAppView" */ '../views/distribution-list-view')
);
const LazySettingsView = lazy(
	() => import(/* webpackChunkName: "settings-view" */ '../legacy/views/settings/settings-view')
);
const LazySearchView = lazy(
	() => import(/* webpackChunkName: "search-view" */ '../legacy/views/search/search-view')
);

const LazyBoardView = lazy(
	() => import(/* webpackChunkName: "edit-view" */ '../legacy/views/edit/edit-view-board-wrapper')
);

const LazyNewContactGroupBoardView = lazy(
	() =>
		import(
			/* webpackChunkName: "newContactGroupView" */ '../views/contact-groups/board/new-contact-group-board'
		)
);

const LazyEditContactGroupBoardView = lazy(
	() =>
		import(
			/* webpackChunkName: "editContactGroupView" */ '../views/contact-groups/board/edit-contact-group-board'
		)
);

const LazyEditDLBoardView = lazy(
	() => import(/* webpackChunkName: "edit-dl-view" */ '../views/board/edit-dl-board')
);

const ContactsAppView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<StoreProvider>
			<ModalManager>
				<LazyContactsView />
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

const DistributionListAppView = (): React.JSX.Element => (
	<Suspense fallback={<Spinner />}>
		<LazyDistributionListAppView />
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

const SearchView = (props: SearchUI.SearchViewProps): React.JSX.Element => (
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

export const ViewsRegistration: FC = () => {
	const [t] = useTranslation();
	const [addSearchView, isAddSearchViewAvailable] =
		useIntegratedFunction<typeof SearchUI.addSearchView>('search-add-view');
	const [removeSearchView, isRemoveSearchViewAvailable] =
		useIntegratedFunction<typeof SearchUI.removeSearchView>('search-remove-view');

	const contactsAppLabel = t('label.app_name', 'Contacts');

	useEffect(() => {
		addRoute({
			route: CONTACTS_ROUTE,
			position: 300,
			visible: true,
			label: contactsAppLabel,
			primaryBar: 'ContactsModOutline',
			secondaryBar: LegacySecondaryBarView,
			appView: ContactsAppView
		});
		addRoute({
			route: GROUPS_ROUTE,
			position: 310,
			visible: true,
			label: t('label.distribution_list_app_name', 'Distribution Lists'),
			primaryBar: 'ListOutline',
			secondaryBar: SecondaryBarView,
			appView: DistributionListAppView
		});
		addSettingsView({
			route: CONTACTS_ROUTE,
			label: contactsAppLabel,
			component: SettingsView
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
	}, [contactsAppLabel, t]);

	useEffect(() => {
		if (isAddSearchViewAvailable) {
			addSearchView({
				id: CONTACTS_APP_ID,
				app: CONTACTS_APP_ID,
				route: CONTACTS_ROUTE,
				label: contactsAppLabel,
				component: SearchView,
				icon: 'ContactsModOutline',
				position: 300
			});
		}

		return () => {
			if (isRemoveSearchViewAvailable) {
				removeSearchView(CONTACTS_APP_ID);
			}
		};
	}, [
		addSearchView,
		contactsAppLabel,
		isAddSearchViewAvailable,
		isRemoveSearchViewAvailable,
		removeSearchView,
		t
	]);

	return null;
};
