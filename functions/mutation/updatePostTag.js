const {updatePostTag} = require('../https/updatePostTags');

exports.default = (root, args, context) => {
  args.name = args.name || '+1';
  if (!context) return;
  return updatePostTag(args, context);
};
