/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Dropdown } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

type PasteContextMenuProps = {
	readonly elementReceivingPaste: HTMLInputElement | null;
	readonly children: ReactElement;
};

export function PasteContextMenu({
	elementReceivingPaste,
	children
}: PasteContextMenuProps): ReactElement {
	const { t } = useTranslation();

	const pasteDropdownItem = {
		id: 'paste',
		label: t('label.paste', 'Paste'),
		onClick: async (): Promise<void> => {
			const dataTransfer = new DataTransfer();
			dataTransfer.setData('text/plain', await navigator.clipboard.readText());

			elementReceivingPaste?.dispatchEvent(
				new ClipboardEvent('paste', {
					clipboardData: dataTransfer,
					bubbles: true,
					cancelable: true
				})
			);
		}
	};

	return (
		<Dropdown display="block" items={[pasteDropdownItem]} contextMenu>
			{children}
		</Dropdown>
	);
}
