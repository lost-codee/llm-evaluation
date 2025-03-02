'use server';

import { getServerSession, User } from 'next-auth';
import { db } from '../../lib/db';

export async function getUser(): Promise<User | null> {
  const session = await getServerSession();

  // If there is no session, return null
  if (!session) {
    return null;
  }

  // Assuming the user object is stored in the session
  const user = session.user as User; // Cast to your User type if necessary

  if (!user.email) {
    return null;
  }

  // find user in database
  const dbUser = await db.user.findUnique({
    where: {
      email: user.email,
    },
  });

  return dbUser;
}
