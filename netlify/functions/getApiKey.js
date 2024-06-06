exports.handler = async (event, context) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not defined' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey }),
  };
};
