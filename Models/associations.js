const User = require('./User');
// const UserFollower = require('./UserFollower');
// const MurmurLike = require('./MurmurLike');
// const Murmur = require('./Murmur');

// User.hasMany(UserFollower, { foreignKey: 'user_id', sourceKey: 'id' });
// UserFollower.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });

// UserFollower.belongsTo(User, { foreignKey: 'followed_by', targetKey: 'id', as: 'follower' }); 

// Murmur.hasMany(MurmurLike, { foreignKey: 'murmur_id', sourceKey: 'id', as: 'likes' });

// module.exports = { User, UserFollower };