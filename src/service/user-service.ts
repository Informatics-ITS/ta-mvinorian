import { UserInsertType } from '@/db/schema';
import { generateAuthToken } from '@/lib/jwt';
import { createResponse } from '@/lib/response';
import { createUser, getUserByEmail, getUserById, loginUser } from '@/repository/user-repository';

export const createUserService = async (user: UserInsertType) => {
  try {
    const userDB = await getUserByEmail(user.email);
    if (userDB)
      return createResponse({
        success: false,
        message: 'user already exists',
        data: undefined,
      });

    const newUser = await createUser(user);
    if (!newUser)
      return createResponse({
        success: false,
        message: 'failed to create user',
        data: undefined,
      });

    const token = generateAuthToken(newUser);
    return createResponse({
      success: true,
      message: 'user created successfully',
      data: { token },
    });
  } catch (_) {
    return createResponse({
      success: false,
      message: 'failed to create user',
      data: undefined,
    });
  }
};

export const loginUserService = async (email: string, password: string) => {
  try {
    const user = await loginUser(email, password);
    if (!user)
      return createResponse({
        success: false,
        message: 'invalid credentials',
        data: undefined,
      });

    const token = generateAuthToken(user);
    return createResponse({
      success: true,
      message: 'login successful',
      data: { token },
    });
  } catch (_) {
    return createResponse({
      success: false,
      message: 'failed to login user',
      data: undefined,
    });
  }
};

export const getMeService = async (userId: string) => {
  try {
    const user = await getUserById(userId);
    if (!user)
      return createResponse({
        success: false,
        message: 'user not found',
        data: undefined,
      });
    return createResponse({ success: true, message: 'user found', data: user });
  } catch (_) {
    return createResponse({
      success: false,
      message: 'failed to get user',
      data: undefined,
    });
  }
};
