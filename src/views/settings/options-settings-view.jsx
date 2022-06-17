/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Container, FormSubSection, Checkbox } from '@zextras/carbonio-design-system';
import Heading from './components/settings-heading';

export default function OptionsSettingsView({ t, settingsObj, updateSettings }) {
	return (
		<FormSubSection label={t('label.options', 'Options')}>
			<Container crossAlignment="baseline" padding={{ all: 'small' }}>
				<Heading title={t('label.options', 'Options')} />
				<Checkbox
					label={t(
						'settings.contacts.checkbox.add_contact_to_emailed_contacts',
						'Add new contacts to "Emailed Contacts"'
					)}
					value={settingsObj.zimbraPrefAutoAddAddressEnabled === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefAutoAddAddressEnabled',
								value: settingsObj.zimbraPrefAutoAddAddressEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
				<Checkbox
					label={t(
						'settings.contacts.checkbox.srch_glbl_addrs_list',
						'Initially search the Global Address List when using the contact picker'
					)}
					value={settingsObj.zimbraPrefGalSearchEnabled === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefGalSearchEnabled',
								value: settingsObj.zimbraPrefGalSearchEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
			</Container>
			<Container crossAlignment="baseline" padding={{ all: 'small' }}>
				<Heading title="Autocomplete" />
				<Checkbox
					label={t(
						'settings.contacts.checkbox.incl_addrs_in_glbl_addrs_list',
						'Include addresses in the Global Address List'
					)}
					value={settingsObj.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefGalAutoCompleteEnabled',
								value: settingsObj.zimbraPrefGalAutoCompleteEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
				<Checkbox
					label={t(
						'settings.contacts.checkbox.include_add_in_shared_contact',
						'Include addresses in shared contacts'
					)}
					value={settingsObj.zimbraPrefSharedAddrBookAutoCompleteEnabled === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefSharedAddrBookAutoCompleteEnabled',
								value:
									settingsObj.zimbraPrefSharedAddrBookAutoCompleteEnabled === 'TRUE'
										? 'FALSE'
										: 'TRUE'
							}
						})
					}
				/>
				<Checkbox
					label={t(
						'settings.contacts.checkbox.autocomplete_on_comma',
						'Select autocomplete match when a comma is typed'
					)}
					value={settingsObj.zimbraPrefAutoCompleteQuickCompletionOnComma === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefAutoCompleteQuickCompletionOnComma',
								value:
									settingsObj.zimbraPrefAutoCompleteQuickCompletionOnComma === 'TRUE'
										? 'FALSE'
										: 'TRUE'
							}
						})
					}
				/>
			</Container>
		</FormSubSection>
	);
}
