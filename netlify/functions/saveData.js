const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  console.log('Event:', event);

  const allowedOrigins = ['https://nmisdigitalproductpassport.netlify.app']
  const origin = event.headers.origin;

  if (!allowedOrigins.includes(origin)) {
    console.log('Origin not allowed:', origin);
    return { statusCode: 403, body: 'Forbidden' };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers.authorization;

  if (!token) {
    console.log('No token provided');
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log('Token verification failed:', error);
    return { statusCode: 403, body: 'Forbidden' };
  }

  const data = JSON.parse(event.body);
  console.log('Data received:', data);

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('DPPDatabase'); // Use your database name here
    const collection = database.collection('entries'); // Use your collection name here
    await collection.insertOne(data);
    console.log('Data inserted successfully');

    return { statusCode: 200, body: JSON.stringify({ message: 'Data saved successfully' }) };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  } finally {
    await client.close();
  }
};
