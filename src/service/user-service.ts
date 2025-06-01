import { UserInsertType } from '@/db/schema';
import { generateAuthToken } from '@/lib/jwt';
import { createResponse } from '@/lib/response';
import { createService } from '@/lib/service';
import { createUser, getUserByEmail, getUserById, loginUser } from '@/repository/user-repository';

export const createUserService = createService(async (t, user: UserInsertType) => {
  try {
    const userDB = await getUserByEmail(user.email);
    if (userDB)
      return createResponse({
        success: false,
        message: t('Response.user-already-exists'),
        data: undefined,
      });

    const newUser = await createUser(user);
    if (!newUser)
      return createResponse({
        success: false,
        message: t('Response.failed-to-create-user'),
        data: undefined,
      });

    const token = generateAuthToken(newUser);
    return createResponse({
      success: true,
      message: t('Response.user-created-successfully'),
      data: { token },
    });
  } catch (_) {
    return createResponse({
      success: false,
      message: t('Response.failed-to-create-user'),
      data: undefined,
    });
  }
});

export const loginUserService = createService(async (t, email: string, password: string) => {
  try {
    const user = await loginUser(email, password);
    if (!user)
      return createResponse({
        success: false,
        message: t('Response.invalid-credentials'),
        data: undefined,
      });

    const token = generateAuthToken(user);
    return createResponse({
      success: true,
      message: t('Response.login-successful'),
      data: { token },
    });
  } catch (_) {
    return createResponse({
      success: false,
      message: t('Response.failed-to-login-user'),
      data: undefined,
    });
  }
});

export const getMeService = createService(async (t, userId: string) => {
  try {
    const user = await getUserById(userId);
    if (!user)
      return createResponse({
        success: false,
        message: t('Response.user-not-found'),
        data: undefined,
      });
    return createResponse({ success: true, message: t('Response.user-found'), data: user });
  } catch (_) {
    return createResponse({
      success: false,
      message: t('Response.failed-to-get-user'),
      data: undefined,
    });
  }
});
