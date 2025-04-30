import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');
pb.autoCancellation(false);

export const usePocketbase = () => {
  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, passwordConfirm: string, name: string) => {
    try {
      const userData = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
      });
      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  const logout = async () => {
    try {
      await pb.authStore.clear();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const refresh = async () => await pb.collection('users').authRefresh()
  return { pb, login, register, logout, refresh };
};
