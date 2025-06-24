const User = require('../../data/models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


class UserService {
  async login(username, password) {
    const user = await User.findOne({ username, status: 'active' });
    if (!user) throw new Error('Mã nhân viên không tồn tại');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Sai mật khẩu');

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    return token;
  }

  async addUser(username, password, role, imageId) {
    
    if (!username || !password || !role) {
      throw new Error('Vui lòng cung cấp username, password và role');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username đã tồn tại');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    try{
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        image: imageId
      });

      await newUser.save();
      return newUser;
    }
    catch (error) {
      throw new Error('Lỗi khi tạo người dùng: ' + error.message);
    }
  }

  async resetPassword(username, password){
    try {
      const account = await User.findOne({ username: username, status: 'active' });

      if (!account) {
          throw new Error('Không tìm thấy tài khoản phù hợp');
      }
      account.password = await bcrypt.hash(password, 10);

      await account.save({
          runValidators: true
      });
      return account;

    } catch (error) {
        throw error;
    }
  }

  async lockAccount(username){
    try{
      const user = await User.findOne({username, status:"active"});

      if (!user){
        throw new Error(`Không tìm thấy tài khoản cho mã nhân viên <b>${username}</b>!`);
      }

      user.status = 'inactive';

      await user.save({
        runValidators: true
      });

      return user;
    }
    catch (error){
      throw error;
    }
  }

  async updateUsername(oldUsername, newUsername) {
    const user = await User.findOne({ username: oldUsername, status: 'active' });
    if (!user) throw new Error('Không tìm thấy tài khoản với username đã cho'); 
    user.username = newUsername;
    return await user.save({ runValidators: true });
  }

  async updateImage(username, imageId) {
    const user = await User.findOne({ username, status: 'active' });
    if (!user) throw new Error('Không tìm thấy tài khoản với username đã cho'); 
    user.image = imageId;
    return await user.save({ runValidators: true });
  }
}

module.exports = new UserService();