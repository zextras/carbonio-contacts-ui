/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
type ParsedEmail = { id: string; email: string; label: string; error: boolean };
type EmailParser = {
	parseEmail: (input: string) => ParsedEmail;
};
export function emailParser(): EmailParser {
	return {
		parseEmail: (input: string): ParsedEmail => {
			const email = clean(input.trim());
			return { id: email, error: !isValid(email), label: email, email };
		}
	};

	function clean(email: string): string {
		const caputured = /.*<(.*)>/.exec(email);
		if (caputured && caputured.length > 1) return caputured[1];

		return email;
	}

	function isValid(email: string): boolean {
		// eslint-disable-next-line max-len, prettier/prettier, no-useless-escape
		const validEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return validEmailRegex.test(String(email).toLowerCase());
	}
}
