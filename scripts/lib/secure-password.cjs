function promptHidden(prompt) {
  const input = process.stdin;
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    return Promise.reject(new Error('Password entry requires an interactive terminal.'));
  }

  return new Promise((resolve, reject) => {
    let value = '';
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      input.removeListener('data', onData);
      input.setRawMode(false);
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\u0003') return finish(new Error('Password entry cancelled.'));
        if (char === '\r' || char === '\n') return finish();
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char === '\u0015') value = '';
        else if (char >= ' ' && char !== '\u007f') value += char;
      }
    };

    input.setEncoding('utf8');
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
    process.stdout.write(prompt);
  });
}

async function promptNewPassword({ label, minLength = 14 }) {
  const password = await promptHidden(`${label} (minimum ${minLength} characters): `);
  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters.`);
  }
  const confirmation = await promptHidden('Confirm password: ');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  return password;
}

module.exports = { promptNewPassword };
