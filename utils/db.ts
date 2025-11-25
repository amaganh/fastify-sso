import mongoose, { Connection } from 'mongoose';

let ssoConnection: Connection | null = null;

export const getSSOConnection = (): Connection => {
  if (ssoConnection) return ssoConnection;

  const uri = process.env.SSO_MONGO_URL || '';
  console.log('🔐 [SSO] Conectando a DB...');
  
  ssoConnection = mongoose.createConnection(uri, { autoIndex: true });
  return ssoConnection;
};