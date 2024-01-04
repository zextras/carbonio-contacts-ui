/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC } from 'react';

export type SearchViewProps = {
	useQuery: () => [Array<any>, (arg: any) => void];
	ResultsHeader: FC<{ label: string }>;
};
