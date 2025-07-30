const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.SHEET_ID; // ID de tu hoja de cálculo
const SHEET_NAME = 'Hoja1'; // O el nombre de tu hoja (pestaña)

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método no permitido',
    };
  }

  const { name, phone } = JSON.parse(event.body || '{}');

  if (!name || !phone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Faltan datos' }),
    };
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  // Autenticación
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    SCOPES
  );

  try {
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, phone, code, expiresAt]],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ code }),
    };
  } catch (err) {
    console.error('Error escribiendo en Sheets:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error escribiendo en Sheets' }),
    };
  }
};
