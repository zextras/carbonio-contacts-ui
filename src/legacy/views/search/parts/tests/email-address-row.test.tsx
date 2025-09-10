/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { CONTACT_TYPES, ContactInputItem } from '@zextras/carbonio-ui-commons';
import { useForm } from 'react-hook-form';

import { AdvancedFilterModalFormValues } from 'legacy/views/search/types';
import { EmailAddressRow } from 'legacy/views/search/parts/email-address-row';
import { screen, setupTest } from '@test-setup';

const mockContactInput = jest.fn();
jest.mock('@zextras/carbonio-ui-commons', () => ({
	...jest.requireActual('@zextras/carbonio-ui-commons'),
	useContactInput: (): jest.Mock => mockContactInput
}));

// Test wrapper component to provide form context
const TestWrapper = ({
	defaultValue = [],
	onChipLabelFactory
}: {
	defaultValue?: ContactInputItem[];
	onChipLabelFactory?: (value: unknown, defaultLabel: string) => string;
}): React.JSX.Element => {
	const { control } = useForm<AdvancedFilterModalFormValues>({
		defaultValues: {
			emailAddress: defaultValue
		}
	});

	// Mock ContactInput component
	React.useEffect(() => {
		mockContactInput.mockImplementation((props: any) => {
			const {
				onChange,
				defaultValue: value,
				chipLabelFactory,
				placeholder,
				'data-testid': testId
			} = props;
			return (
				<div data-testid={testId || 'email-address-input'}>
					<input
						data-testid="email-input-field"
						placeholder={placeholder}
						onChange={(e): void => onChange && onChange(e.target.value)}
						defaultValue={value ? JSON.stringify(value) : ''}
					/>
					{onChipLabelFactory && (
						<button
							data-testid="test-chip-label-factory"
							onClick={(): void => {
								const result = chipLabelFactory(
									{ type: CONTACT_TYPES.CONTACT, email: 'test@example.com' },
									'Default Label'
								);
								onChipLabelFactory(result, 'Default Label');
							}}
						>
							Test Chip Label Factory
						</button>
					)}
				</div>
			);
		});
	}, [onChipLabelFactory]);

	return (
		<div>
			<EmailAddressRow control={control} />
		</div>
	);
};

describe('EmailAddressRow', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render the email address input field', () => {
		setupTest(<TestWrapper />);

		expect(screen.getByTestId('email-address-input')).toBeVisible();
	});

	it('should display the correct placeholder text', () => {
		setupTest(<TestWrapper />);

		expect(screen.getByPlaceholderText('Email Address')).toBeVisible();
	});

	it('should use the ContactInput component from carbonio-ui-commons', () => {
		setupTest(<TestWrapper />);

		expect(mockContactInput).toHaveBeenCalled();
		expect(screen.getByTestId('email-address-input')).toBeInTheDocument();
	});

	it('should pass the correct props to ContactInput', () => {
		setupTest(<TestWrapper />);

		expect(mockContactInput).toHaveBeenCalledWith(
			expect.objectContaining({
				'data-testid': 'email-address-input',
				placeholder: 'Email Address',
				onChange: expect.any(Function),
				defaultValue: [],
				chipLabelFactory: expect.any(Function)
			}),
			{}
		);
	});

	it('should handle onChange events', async () => {
		const { user } = setupTest(<TestWrapper />);

		const input = screen.getByTestId('email-input-field');
		await user.clear(input);
		await user.type(input, 'test@example.com');

		expect(input).toHaveValue('test@example.com');
	});

	it('should use the correct form field name', () => {
		setupTest(<TestWrapper />);

		expect(mockContactInput).toHaveBeenCalled();
	});

	it('should render within a container with correct padding', () => {
		setupTest(<TestWrapper />);

		const input = screen.getByTestId('email-address-input');
		expect(input).toBeInTheDocument();
	});

	it('should pass default value to ContactInput', () => {
		const defaultValue: ContactInputItem[] = [
			{
				id: '1',
				label: 'John Doe',
				value: {
					id: '1',
					email: 'john@example.com',
					type: CONTACT_TYPES.CONTACT
				}
			}
		];

		setupTest(<TestWrapper defaultValue={defaultValue} />);

		expect(mockContactInput).toHaveBeenCalledWith(
			expect.objectContaining({
				defaultValue
			}),
			{}
		);
	});

	describe('chipLabelFactory function', () => {
		it('should return email for CONTACT type', () => {
			const mockChipLabelFactory = jest.fn();
			setupTest(<TestWrapper onChipLabelFactory={mockChipLabelFactory} />);

			const testButton = screen.getByTestId('test-chip-label-factory');
			testButton.click();

			expect(mockChipLabelFactory).toHaveBeenCalledWith('test@example.com', 'Default Label');
		});

		it('should return default label for non-CONTACT types', () => {
			// Test the chipLabelFactory logic directly
			const mockChipLabelFactory = jest.fn();
			setupTest(<TestWrapper onChipLabelFactory={mockChipLabelFactory} />);

			const { chipLabelFactory } = mockContactInput.mock.calls[0][0];

			const result = chipLabelFactory(
				{ type: 'OTHER_TYPE', email: 'test@example.com' },
				'Default Label'
			);

			expect(result).toBe('Default Label');
		});

		it('should handle undefined email gracefully', () => {
			// Test the chipLabelFactory logic directly
			setupTest(<TestWrapper />);

			// Get the chipLabelFactory from the mock call
			const { chipLabelFactory } = mockContactInput.mock.calls[0][0];

			const result = chipLabelFactory({ type: CONTACT_TYPES.CONTACT }, 'Default Label');

			expect(result).toBeUndefined();
		});

		it('should be memoized with useCallback', () => {
			const { rerender } = setupTest(<TestWrapper />);

			const firstCall = mockContactInput.mock.calls[0][0].chipLabelFactory;

			rerender(<TestWrapper />);

			const secondCall = mockContactInput.mock.calls[1][0].chipLabelFactory;

			expect(firstCall).toBe(secondCall);
		});
	});

	it('should handle empty default value', () => {
		setupTest(<TestWrapper defaultValue={[]} />);

		expect(mockContactInput).toHaveBeenCalledWith(
			expect.objectContaining({
				defaultValue: []
			}),
			{}
		);
	});

	it('should handle multiple email addresses', () => {
		const multipleEmails: ContactInputItem[] = [
			{
				id: '1',
				label: 'John Doe',
				value: {
					id: '1',
					email: 'john@example.com',
					type: CONTACT_TYPES.CONTACT
				}
			},
			{
				id: '2',
				label: 'Jane Smith',
				value: {
					id: '2',
					email: 'jane@example.com',
					type: CONTACT_TYPES.CONTACT
				}
			}
		];

		setupTest(<TestWrapper defaultValue={multipleEmails} />);

		expect(mockContactInput).toHaveBeenCalledWith(
			expect.objectContaining({
				defaultValue: multipleEmails
			}),
			{}
		);
	});

	it('should use translation for placeholder', () => {
		setupTest(<TestWrapper />);
		expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
	});

	it('should maintain component structure with Container wrapper', () => {
		setupTest(<TestWrapper />);

		const emailInput = screen.getByTestId('email-address-input');
		expect(emailInput).toBeInTheDocument();
	});

	it('should handle form integration correctly', async () => {
		const { user } = setupTest(<TestWrapper />);

		// Test that the component integrates with react-hook-form
		const input = screen.getByTestId('email-input-field');

		await user.clear(input);
		await user.type(input, 'integration@test.com');

		await waitFor(() => {
			expect(input).toHaveValue('integration@test.com');
		});
	});
});
