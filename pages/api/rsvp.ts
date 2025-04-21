import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  //constants 
  const client = await clientPromise;
  const db = client.db('BarbieNight');
  const collection = db.collection('Users');

  //post - create a rsvp
  if (req.method === 'POST') {
    const { FirstName, LastName, RSVP } = req.body;

    if (!FirstName || !LastName || !RSVP) {
      return res.status(400).json({ error: 'Error: Missing Required Fields' });
    }

    const result = await collection.insertOne({
      FirstName,
      LastName,
      RSVP,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'RSVP Saved!', id: result.insertedId });
  }

  //get - return 1 if user inside already, 0 if not
  if (req.method === 'GET') {
    const { first, last } = req.query;
  
    if (!first || !last) {
      return res.status(400).json({ error: 'Error: FirstName and LastName are Required' });
    }
  
    //query through db
    const user = await collection.findOne({
      FirstName: (first as string).toLowerCase(),
      LastName: (last as string).toLowerCase(),
    });
  
    if (user) {
      return res.status(200).json({ exists: 1 });
    } else {
      return res.status(200).json({ exists: 0 });
    }
  }

  //put - update rsvp
  if (req.method === 'PUT') {
    const { FirstName, LastName, RSVP } = req.body;

    if (!FirstName || !LastName || !RSVP) {
      return res.status(400).json({ error: 'Error: Missing Required Fields' });
    }

    const result = await collection.updateOne(
      { FirstName, LastName },
      {
        $set: {
          RSVP,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Error: User not found for update.' });
    }

    return res.status(200).json({ message: 'RSVP Updated!' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}