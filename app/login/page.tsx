'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ILoginFormState } from '@/interfaces/index';
import { ChatName } from '@/components/ChatName';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ERROR_MESSAGE } from '@/constants/constants';
import toast from 'react-hot-toast';

enum LoginFields {
  EMAIL = 'email',
  PASSWORD = 'password',
}

const validationSchema = Yup.object()
  .shape({
    email: Yup.string()
      .email(ERROR_MESSAGE.email)
      .required(ERROR_MESSAGE.required),
    password: Yup.string()
      .min(6, ERROR_MESSAGE.minLength)
      .max(20, ERROR_MESSAGE.maxLength)
      .required(ERROR_MESSAGE.required),
  })
  .required();

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const methods = useForm<ILoginFormState>({
    resolver: yupResolver(validationSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const onSubmit = async (data: ILoginFormState) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      if (user) {
        router.push('/');
      }
    } catch (error) {
      toast.error(ERROR_MESSAGE.invalidCred);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen font-primary p-10 m-2">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-2xl shadow-lg p-10"
        >
          <ChatName />
          {Object.values(LoginFields).map((field) => (
            <div key={field}>
              <label className="label">
                <span className="text-base label-text">{field}</span>
              </label>
              <input
                className="w-full input input-bordered"
                type={field === LoginFields.PASSWORD ? 'password' : 'text'}
                placeholder={field}
                {...register(field)}
              />
              {errors[field] && (
                <p className="text-red-500 font-extralight text-xs">
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}
          <button
            type="submit"
            className="btn btn-block bg-custom-primary hover:bg-custom-hover text-white"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Sign In'
            )}
          </button>

          <span>
            Do not have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Register
            </Link>
          </span>
        </form>
      </FormProvider>
    </div>
  );
};

export default LoginPage;
