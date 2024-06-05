const { MongoClient } = require('mongodb');

exports.handler = async (event) => {
  console.log('Event:', event);

  const allowedOrigins = ['https://nmisdigitalproductpassport.netlify.app']; // Replace with your domain
  const origin = event.headers.origin;

  if (!allowedOrigins.includes(origin)) {
    console.log('Origin not allowed:', origin);
    return { statusCode: 403, body: 'Forbidden' };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);
  console.log('Data received:', data);

  const uri = process.env.MONGODB_URI;
  console.log('MongoDB URI:', uri);
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('DPPDatabase'); // Use your database name here
    const collection = database.collection('entries'); // Use your collection name here
    
    console.log('Inserting data into collection...');
    await collection.insertOne(data);
    console.log('Data inserted successfully');

    return { statusCode: 200, body: JSON.stringify({ message: 'Data saved successfully' }) };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  } finally {
    console.log('Closing MongoDB connection');
    await client.close();
  }
};
