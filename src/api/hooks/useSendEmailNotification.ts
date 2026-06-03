'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import { SEND_EMAIL_NOTIFICATION_MUTATION } from '@/api/graphql/apps/sendEmailNotification';
import type {
    SendEmailNotificationInput,
    SendEmailNotificationResponse,
} from '@/api/graphql/apps/types';

export function useSendEmailNotification() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const sendNotification = useCallback(
        async (input: SendEmailNotificationInput, pdf: File) => {
            setLoading(true);
            setError(null);
            setUploadProgress(0);

            try {
                const result = await graphqlRequestClient<SendEmailNotificationResponse>(
                    SEND_EMAIL_NOTIFICATION_MUTATION,
                    {
                        variables: { input },
                        files: [pdf],
                        onProgress: (percent) => setUploadProgress(percent),
                    }
                );
                setLoading(false);
                return result.enviarNotificacionCorreo;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { sendNotification, loading, error, uploadProgress };
}