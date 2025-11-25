import { Schema, Document } from 'mongoose';
import { getSSOConnection } from '../utils/db';
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
  username: string;
  passwordHash: string;
  project?: string | null; // null or undefined = generic/global user
  adminOnly?: boolean; // true = only admin can create/delete
  comparePassword(candidate: string): Promise<boolean>;
}


const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  project: { type: String, default: null }, // null = generic
  adminOnly: { type: Boolean, default: false }
});

UserSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const conn = getSSOConnection();
const UserModel = conn.model<IUser>('User', UserSchema);

export default UserModel;