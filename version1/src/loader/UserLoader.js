// @flow
import DataLoader from 'dataloader';
import { User as UserModel } from '../model';
import ConnectionFromMongoCursor from '../connection/ConnectionFromMongoCursor';

type UserType = {
  id: string,
  _id: string,
  name: string,
  email: string,
  active: boolean,
}

export default class User {
  id: string;
  _id: string;
  name: string;
  email: string;
  active: boolean;

  static userLoader = new DataLoader(
    ids => Promise.all(ids.map(id => UserModel.findOne({ _id: id }))),
  );

  constructor(data: UserType, viewer) {
    this.id = data.id;
    this._id = data._id;
    this.name = data.name;

    // you can only see your own email, and your active status
    if (viewer && viewer._id.equals(data._id)) {
      this.email = data.email;
      this.active = data.active;
    }
  }

  static viewerCanSee(viewer, data) {
    // Anyone can se another user
    return true;
  }

  static async load(viewer, id) {
    if (!id) return null;

    const data = await User.userLoader.load(id);

    if (!data) return null;

    return User.viewerCanSee(viewer, data) ? new User(data, viewer) : null;
  }

  static async loadUsers(viewer, args) {
    const where = args.search ? { name: { $regex: new RegExp(`^${args.search}`, 'ig') } } : {};
    const users = UserModel
      .find(where, { _id: 1 });

    return ConnectionFromMongoCursor.connectionFromMongoCursor(viewer, users, args, User.load);
  }
}
