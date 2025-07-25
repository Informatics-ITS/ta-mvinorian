import { UserActionInsertType, UserInsertType } from '@/db/schema';
import { generateAuthToken } from '@/lib/jwt';
import { createResponse } from '@/lib/response';
import { createService } from '@/lib/service';
import { createUser, createUserAction, getUserByEmail, getUserById, loginUser } from '@/repository/user-repository';

export const createUserService = createService(async (t, user: UserInsertType) => {
  try {
    const userDB = await getUserByEmail(user.email);
    if (userDB)
      return createResponse({
        success: false,
        message: t('response.user-already-exists'),
        data: undefined,
      });

    const newUser = await createUser(user);
    if (!newUser)
      return createResponse({
        success: false,
        message: t('response.failed-to-create-user'),
        data: undefined,
      });

    const token = generateAuthToken(newUser);
    return createResponse({
      success: true,
      message: t('response.user-created-successfully'),
      data: { token },
    });
  } catch (_) {
    return createResponse({
      success: false,
      message: t('response.failed-to-create-user'),
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
        message: t('response.invalid-credentials'),
        data: undefined,
      });

    const token = generateAuthToken(user);
    return createResponse({
      success: true,
      message: t('response.login-successful'),
      data: { token },
    });
  } catch (_) {
    return createResponse({
      success: false,
      message: t('response.failed-to-login-user'),
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
        message: t('response.user-not-found'),
        data: undefined,
      });
    return createResponse({ success: true, message: t('response.user-found'), data: user });
  } catch (_) {
    return createResponse({
      success: false,
      message: t('response.failed-to-get-user'),
      data: undefined,
    });
  }
});

export const saveUserActionService = createService(async (t, userAction: UserActionInsertType) => {
  try {
    const newUserAction = await createUserAction(userAction);
    if (!newUserAction)
      return createResponse({ success: false, message: t('response.failed-to-save-user-action'), data: undefined });

    return createResponse({
      success: true,
      message: t('response.successfully-saved-user-action'),
      data: newUserAction,
    });
  } catch (_) {
    return createResponse({ success: false, message: t('response.failed-to-save-user-action'), data: undefined });
  }
});
