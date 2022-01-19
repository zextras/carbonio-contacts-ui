/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback, useContext } from 'react';
import {
	useUserSettings,
	useReplaceHistoryCallback,
	editSettings
} from '@zextras/carbonio-shell-ui';
import {
	Container,
	Padding,
	Text,
	Button,
	Row,
	Divider,
	FormSection,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { differenceObject } from './components/utils';
import OptionsSettingsView from './options-settings-view';

export default function ContactSettingsView() {
	const [t] = useTranslation();
	const settings = useUserSettings()?.prefs;
	const [settingsObj, setSettingsObj] = useState({ ...settings });
	const [updatedSettings, setUpdatedSettings] = useState({});
	const replaceHistory = useReplaceHistoryCallback();
	const createSnackbar = useContext(SnackbarManagerContext);

	const onClose = useCallback(() => {
		setSettingsObj({ ...settings });
		setUpdatedSettings({});
	}, [settings]);

	const updateSettings = useCallback(
		(e) => {
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
		editSettings({ prefs: updatedSettings }).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `new`,
					replace: true,
					type: 'info',
					label: t('message.snackbar.settings_saved', 'Edits saved correctly'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else {
				createSnackbar({
					key: `new`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
	}, [updatedSettings, createSnackbar, t]);

	return (
		<Container
			orientation="vertical"
			mainAlignment="space-around"
			background="gray5"
			style={{ overflowY: 'auto' }}
		>
			<Row orientation="horizontal" width="100%">
				<Row
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					width="50%"
					crossAlignment="flex-start"
				>
					<Text size="large" weight="regular">
						{t('label.contact_setting', 'Contact Settings')}
					</Text>
				</Row>
				<Row
					padding={{ all: 'small' }}
					width="50%"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
				>
					<Padding right="small">
						<Button
							label={t('label.discard_changes', 'DISCARD CHANGES')}
							onClick={onClose}
							color="secondary"
							disabled={disabled}
						/>
					</Padding>
					<Button
						label={t('label.save', 'Save')}
						color="primary"
						onClick={saveChanges}
						disabled={disabled}
					/>
				</Row>
			</Row>
			<Divider />
			<Container
				orientation="vertical"
				mainAlignment="baseline"
				crossAlignment="baseline"
				background="gray5"
				style={{ overflowY: 'auto' }}
			>
				<FormSection width="50%" minWidth="calc(min(100%, 512px))">
					<OptionsSettingsView t={t} settingsObj={settingsObj} updateSettings={updateSettings} />
				</FormSection>
			</Container>
		</Container>
	);
}
