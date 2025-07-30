const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = 'CodigosAcceso';

exports.handler = async function () {
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    SCOPES
  );

  try {
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:D`,
    });

    const rows = response.data.values || [];

    const data = rows.slice(1).map(([name, phone, code, expiresAt]) => ({
      name,
      phone,
      code,
      expiresAt,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Error leyendo de Sheets:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error leyendo de Sheets' }),
    };
  }
};
