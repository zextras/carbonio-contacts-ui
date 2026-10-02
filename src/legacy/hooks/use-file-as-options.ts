/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { FILE_AS_FREE_TEXT } from 'legacy/utils/file-as';

export type FileAsOption = { label: string; value: number };

export const useFileAsOptions = (): FileAsOption[] => {
	const [t] = useTranslation();
	return useMemo(
		() => [
			{ label: t('file_as.last_first', 'Last, First'), value: 1 },
			{ label: t('file_as.first_last', 'First Last'), value: 2 },
			{ label: t('file_as.company', 'Company'), value: 3 },
			{ label: t('file_as.last_first_company', 'Last, First (Company)'), value: 4 },
			{ label: t('file_as.first_last_company', 'First Last (Company)'), value: 5 },
			{ label: t('file_as.company_last_first', 'Company (Last, First)'), value: 6 },
			{ label: t('file_as.company_first_last', 'Company (First Last)'), value: 7 },
			{ label: t('file_as.custom', 'Custom'), value: FILE_AS_FREE_TEXT }
		],
		[t]
	);
};
