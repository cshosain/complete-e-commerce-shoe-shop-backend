export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken ? user.generateToken() : user.token;
  //remove password if present
  if (user.password) delete user.password;
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true, // 👈 Must be true in production
      sameSite: "None", // 👈 Must be 'None' for cross-origin
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
