/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback } from 'react';

import { Container, useSnackbar } from '@zextras/carbonio-design-system';
import {
	useUserSettings,
	SettingsHeader,
	updateSettings as shellUpdateSettings
} from '@zextras/carbonio-shell-ui';
import { JSNS, useUpdateView } from '@zextras/carbonio-ui-commons';
import { AccountSettingsPrefs, soapFetchV2 } from '@zextras/carbonio-ui-soap-lib';
import { useTranslation } from 'react-i18next';

import { differenceObject } from 'legacy/views/settings/components/utils';
import OptionsSettingsView from 'legacy/views/settings/options-settings-view';

export default function ContactSettingsView(): React.JSX.Element {
	const [t] = useTranslation();
	const settings = useUserSettings()?.prefs;
	const [settingsObj, setSettingsObj] = useState({ ...settings });
	const [updatedSettings, setUpdatedSettings] = useState({});
	const createSnackbar = useSnackbar();
	useUpdateView();

	const onClose = useCallback(() => {
		setSettingsObj({ ...settings });
		setUpdatedSettings({});
	}, [settings]);

	const updateSettings = useCallback(
		(e: {
			target: {
				name: string;
				value: string;
			};
		}) => {
			setSettingsObj({ ...settingsObj, [e.target.name]: e.target.value });
			setUpdatedSettings({ ...updatedSettings, [e.target.name]: e.target.value });
		},
		[settingsObj, updatedSettings]
	);

	const settingsToUpdate = useMemo(
		() => differenceObject(updatedSettings, settings),
		[updatedSettings, settings]
	);

	const disabled = useMemo(() => Object.keys(settingsToUpdate).length === 0, [settingsToUpdate]);

	const saveChanges = useCallback(() => {
		const promise = soapFetchV2<
			{ _attrs: AccountSettingsPrefs; _jsns: JSNS },
			{ ModifyPrefsResponse: Record<string, unknown> }
		>('ModifyPrefs', {
			_jsns: JSNS.ACCOUNT,
			_attrs: updatedSettings
		}).then((rawSoapResponse) => {
			if ('Fault' in rawSoapResponse.Body) {
				createSnackbar({
					key: `new`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else {
				shellUpdateSettings({ prefs: updatedSettings });
				createSnackbar({
					key: `new`,
					replace: true,
					severity: 'info',
					label: t('message.snackbar.settings_saved', 'Edits saved correctly'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
		return Promise.allSettled([promise]);
	}, [createSnackbar, t, updatedSettings]);
	const title = useMemo(() => t('label.contact_setting', 'Contact Settings'), [t]);
	return (
		<>
			<SettingsHeader onCancel={onClose} onSave={saveChanges} title={title} isDirty={!disabled} />
			<Container
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="baseline"
				background="gray5"
				gap="1rem"
				padding={{ all: 'medium' }}
				style={{ overflowY: 'auto' }}
			>
				<OptionsSettingsView t={t} settingsObj={settingsObj} updateSettings={updateSettings} />
			</Container>
		</>
	);
}
