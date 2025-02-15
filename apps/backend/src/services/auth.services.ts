export const registerService = async () => {
  return { message: 'User registered successfully!' };
};

interface LoginBody {
  email: string;
  password: string;
}

// sample throw error
export const loginService = async (body: LoginBody) => {
 try {
  if (!body.email || !body.password) {
    throw { status: 400, msg: 'Email and password is required' };
  }

  return {
    message: 'User login successfully',
    email: body.email,
    password: body.password,
  };
 } catch (error) {
  throw error
 }
};
