type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

/** Remove admin-only mail/gateway configuration before returning settings publicly. */
export function sanitizePublicSiteSettings<T extends JsonRecord>(setting: T) {
  const {
    emailSettings: _emailSettings,
    emailTemplates: _emailTemplates,
    paymentGateways: privateGatewayConfig,
    ...publicFields
  } = setting;
  const gateways = asRecord(privateGatewayConfig);
  const localization = asRecord(gateways.localization);
  const styling = asRecord(gateways.styling);

  const publicLocalization = {
    ...(typeof localization.defaultCurrency === 'string' && { defaultCurrency: localization.defaultCurrency }),
    ...(typeof localization.defaultLanguage === 'string' && { defaultLanguage: localization.defaultLanguage }),
    ...(Array.isArray(localization.supportedCurrencies) && {
      supportedCurrencies: localization.supportedCurrencies.filter((item): item is string => typeof item === 'string'),
    }),
    ...(Array.isArray(localization.supportedLanguages) && {
      supportedLanguages: localization.supportedLanguages.filter((item): item is string => typeof item === 'string'),
    }),
    ...(typeof localization.fxRate === 'number' && Number.isFinite(localization.fxRate) && { fxRate: localization.fxRate }),
  };

  const publicStyling = {
    ...(typeof styling.globalScale === 'number' && Number.isFinite(styling.globalScale) && { globalScale: styling.globalScale }),
    ...(typeof styling.voice === 'string' && ['heritage', 'institutional', 'editorial'].includes(styling.voice) && { voice: styling.voice }),
  };

  return {
    ...publicFields,
    paymentGateways: {
      localization: publicLocalization,
      styling: publicStyling,
    },
  };
}
