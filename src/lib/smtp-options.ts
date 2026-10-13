/** Standard submission ports select their TLS protocol automatically. */
export function smtpConnectionOptions(config: { port?: number; secure?: boolean }) {
  const port = Number(config.port) || 587;
  const secure = port === 465 || (port !== 587 && config.secure === true);
  return { port, secure, requireTLS: port === 587 };
}
