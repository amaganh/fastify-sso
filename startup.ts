import { getSSOConnection } from './utils/db';

export default async function startup() {
  console.log('🔐 [SSO] Inicializando...');
  getSSOConnection(); // Forzar creación de conexión
}