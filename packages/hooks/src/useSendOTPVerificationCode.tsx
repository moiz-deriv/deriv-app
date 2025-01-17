import React, { useEffect, useState } from 'react';
import { useMutation } from '@deriv/api';
import { TSocketError } from '@deriv/api/types';
import useRequestPhoneNumberOTP from './useRequestPhoneNumberOTP';
import { useStore } from '@deriv/stores';
import useSettings from './useSettings';
import { emailOTPErrorMessage, phoneOTPErrorMessage } from '@deriv/shared';
import usePhoneVerificationAnalytics from './usePhoneVerificationAnalytics';

/** A hook for verifying Phone Number OTP and Email OTP */
const useSendOTPVerificationCode = () => {
    const [phone_otp_error_message, setPhoneOtpErrorMessage] = useState<React.ReactNode>('');
    const [show_cool_down_period_modal, setShowCoolDownPeriodModal] = useState(false);
    const { ui } = useStore();
    const { setIsForcedToExitPnv } = ui;
    const {
        data,
        mutate,
        error: phone_otp_error,
        isSuccess: is_phone_number_verified,
        ...rest
    } = useMutation('phone_number_verify');
    const { data: account_settings, refetch } = useSettings();
    const {
        sendEmailOTPVerification,
        email_otp_error,
        is_email_verified,
        getCurrentCarrier,
        getOtherCarrier,
        requestOnSMS,
        requestOnWhatsApp,
    } = useRequestPhoneNumberOTP();
    const { trackPhoneVerificationEvents } = usePhoneVerificationAnalytics();
    // @ts-expect-error will remove once solved
    const challenge_attempts_remaining = account_settings?.phone_number_verification?.challenge_attempts_remaining;
    // @ts-expect-error will remove once solved
    const verify_attempts_remaining = account_settings?.phone_number_verification?.verify_attempts_remaining;

    type OTPErrorCode =
        | 'PhoneCodeExpired'
        | 'InvalidOTP'
        | 'EmailCodeExpired'
        | 'InvalidToken'
        | 'NoAttemptsLeft'
        | 'PhoneNumberVerificationSuspended';

    const formatOtpError = (error: TSocketError<'phone_number_verify' | 'phone_number_challenge'>['error']) => {
        const errorHandlers: Record<OTPErrorCode, () => void> = {
            PhoneCodeExpired: () =>
                setPhoneOtpErrorMessage(phoneOTPErrorMessage('PhoneCodeExpired', verify_attempts_remaining)),
            InvalidOTP: () => {
                refetch();
                if (verify_attempts_remaining - 1 === 0) {
                    setIsForcedToExitPnv(true);
                    setShowCoolDownPeriodModal(true);
                    return;
                }
                setPhoneOtpErrorMessage(phoneOTPErrorMessage('InvalidOTP', verify_attempts_remaining));
            },
            EmailCodeExpired: () =>
                setPhoneOtpErrorMessage(
                    emailOTPErrorMessage(
                        'EmailCodeExpired',
                        getCurrentCarrier,
                        getOtherCarrier,
                        challenge_attempts_remaining
                    )
                ),
            InvalidToken: () => {
                refetch();
                if (challenge_attempts_remaining - 1 === 0) {
                    setIsForcedToExitPnv(true);
                    setShowCoolDownPeriodModal(true);
                    return;
                }
                setPhoneOtpErrorMessage(
                    emailOTPErrorMessage(
                        'InvalidToken',
                        getCurrentCarrier,
                        getOtherCarrier,
                        challenge_attempts_remaining
                    )
                );
            },
            NoAttemptsLeft: () => {
                refetch();
                setIsForcedToExitPnv(true);
                setShowCoolDownPeriodModal(true);
            },
            PhoneNumberVerificationSuspended: () =>
                setPhoneOtpErrorMessage(
                    emailOTPErrorMessage(
                        'PhoneNumberVerificationSuspended',
                        getCurrentCarrier,
                        getOtherCarrier,
                        challenge_attempts_remaining
                    )
                ),
        };

        const errorCode = error.code as OTPErrorCode;

        if (errorCode in errorHandlers) {
            errorHandlers[errorCode]();
        } else {
            setPhoneOtpErrorMessage(error.message);
        }
    };

    // Usage in useEffect
    useEffect(() => {
        if (phone_otp_error) {
            trackPhoneVerificationEvents({
                action: 'error',
                subform_name: 'verify_phone_otp_screen',
                // @ts-expect-error will remove once solved
                error_code: phone_otp_error.code,
            });
            // @ts-expect-error will remove once solved
            formatOtpError(phone_otp_error);
        } else if (email_otp_error) {
            // @ts-expect-error will remove once solved
            formatOtpError(email_otp_error);
        }
    }, [phone_otp_error, email_otp_error]);

    const sendPhoneOTPVerification = (value: string) => {
        mutate({ payload: { otp: value } });
    };

    return {
        data,
        sendPhoneOTPVerification,
        sendEmailOTPVerification,
        requestOnSMS,
        requestOnWhatsApp,
        email_otp_error,
        phone_otp_error,
        phone_otp_error_message,
        setPhoneOtpErrorMessage,
        show_cool_down_period_modal,
        setShowCoolDownPeriodModal,
        is_phone_number_verified,
        is_email_verified,
        mutate,
        ...rest,
    };
};

export default useSendOTPVerificationCode;
