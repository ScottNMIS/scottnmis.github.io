const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const allowedOrigins = ['https://nmisdigitalproductpassport.netlify.app'];
  const origin = event.headers.origin;

  if (!allowedOrigins.includes(origin)) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers.authorization;

  if (!token) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const data = JSON.parse(event.body);

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('DPPDatabase');
    const collection = database.collection('entries');
    await collection.insertOne(data);

    return { statusCode: 200, body: JSON.stringify({ message: 'Data saved successfully' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  } finally {
    await client.close();
  }
};
